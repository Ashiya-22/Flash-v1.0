import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId,io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const friendsArray = req.user.friends;
    const filteredUsers = await User.find({ _id: { $in: friendsArray } }).select("profilePic publicKey fullName _id");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;

  // Check if query parameter is provided and not empty
  if (!q || q.trim() === "") {
    return res.status(400).json({ message: "Query parameter 'q' is required" });
  }

  try {
    const friendsArray = req.user.friends;

    const suggestions = await User.find(
      {
        fullName: { $regex: `^${q.trim()}`, $options: "i" }, // Match names starting with `q`, case-insensitive
        _id: { $nin: friendsArray }, // Exclude friends' IDs
      },
      "profilePic publicKey fullName _id"
    ).limit(5); 

    res.status(200).json(suggestions);
  } catch (error) {
    console.error("Error in searchUsers controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const addFriend = async (req, res) => {
  const { friendId } = req.body; // ID of the user to be added as a friend
  const loggedInUserId = req.user._id; // ID of the logged-in user


  if (!friendId) {
    return res.status(400).json({ message: "Friend ID is required" });
  }

  try {
    // Update the logged-in user's friends array
    const loggedInUserUpdate = User.findByIdAndUpdate(
      loggedInUserId,
      { $addToSet: { friends: friendId } },
      { new: true } 
    );

    // Update the friend's friends array
    const friendUserUpdate = User.findByIdAndUpdate(
      friendId,
      { $addToSet: { friends: loggedInUserId } },
      { new: true }
    );

    // Execute both updates concurrently
    await Promise.all([loggedInUserUpdate, friendUserUpdate]);

    res.status(200).json({message: "Friend added successfully"});
  } catch (error) {
    console.error("Error in addFriend controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // Chat partner ID
    const myId = req.user._id; // Current user ID
    const { lastMessageTimestamp, limit = 10 } = req.query; // Cursor and limit from query params

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

    // Check if there are more messages
    const hasMore = payLoad.length === parseInt(limit);

    res.status(200).json({
      messages: payLoad.reverse(), // Reverse to show older messages at the top
      hasMore,
    });
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



export const sendMessage = async (req, res) => {
    try {
      const { text, image } = req.body;
      const { id: receiverId } = req.params;
      const senderId = req.user._id;

      let imageUrl;
      let newMessage;
      if (image) {
        // Upload base64 image to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
      
      newMessage = new Message({
        senderId,
        receiverId,
        text:text?text:null,
        image:image?imageUrl:null,
        qC:null,
      });

      await newMessage.save();

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