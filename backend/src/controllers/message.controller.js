import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";
import { encryptMessage,retrievePrivateKey,decryptMessage } from "../lib/utils.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Chat partner ID
    const myId = req.user._id; // Current user ID
    const { lastMessageTimestamp, limit = 10 } = req.query; // Cursor and limit from query params
    const {publickey}=req.headers;
    const {privateKey}=retrievePrivateKey(req.user.email.split('@')[0]);

    const query = {
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    };

    // If a cursor is provided, fetch messages older than the timestamp
    if (lastMessageTimestamp) {
      query.createdAt = { $lt: new Date(lastMessageTimestamp) };
    }

    // Fetch messages sorted by creation date, descending (latest first)
    const payLoad = await Message.find(query)
      .sort({ createdAt: -1 }) // Latest messages first
      .limit(parseInt(limit));

    let decryptedMessage=decryptMessage(payLoad,privateKey,publickey);

    // Check if there are more messages
    const hasMore = decryptedMessage.length === parseInt(limit);

    res.status(200).json({
      messages: decryptedMessage.reverse(), // Reverse to show older messages at the top
      hasMore,
    });
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const sendMessage = async (req, res) => {
    try {
      const { text, image, publicKey } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;
      const {privateKey}=retrievePrivateKey(req.user.email.split('@')[0]);

      let imageUrl;
      let payLoad;
      let newMessage;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }

      let data=image?(imageUrl):(text);
      payLoad = encryptMessage(data,privateKey,publicKey);
      
      newMessage = new Message({
        senderId,
        receiverId,
        text:text?payLoad.encryptedMessage:null,
        image:image?payLoad.encryptedMessage:null,
        qC:null
      });

      await newMessage.save();

      newMessage.text=text?text:null;
      newMessage.image=image?image:null;
      newMessage.iv=null;
      newMessage.qC=true;

      const receiverSocketId = getReceiverSocketId(receiverId);
      
      if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",newMessage);
      }
      
      res.status(201).json(newMessage);
    } catch (error) {
      console.log("Error in sendMessage controller: ", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };