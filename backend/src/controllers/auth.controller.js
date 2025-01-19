import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req,res)=>{
    const {fullName,email,password,publicKey}=req.body;

    try {
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
      
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }
        const user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "Email already exists" });

        // Hashing the password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password,salt);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            publicKey: publicKey,
        });

        if(newUser){
            // Generate JWT token
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
                hasDownloadedKey,
            });
        }else{
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const login = async (req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await User.findOne({email});

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
          return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(200).json({
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          profilePic: user.profilePic,
          hasDownloadedKey: user.hasDownloadedKey,
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const logout = (req,res)=>{
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export const updateProfile = async (req,res)=>{
    try {
        const { profilePic } = req.body;
        const userId = req.user._id;

        if (!profilePic) {
            return res.status(400).json({ message: "Profile pic is required" });
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { profilePic: uploadResponse.secure_url },
            { new: true }
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("error in update profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteProfile = async (req,res)=>{
    try {
        const userId = req.user._id;
        res.cookie("jwt", "", { maxAge: 0 });
        const userDeletion = await User.findByIdAndDelete(userId);
        if (!userDeletion) {
            return res.status(404).json({ message: "User not found" });
        }
        await Message.deleteMany({
            $or: [{ senderId: userId }, { receiverId: userId }],
        });
        res.status(200).json({ message: "Account and related messages deleted successfully" });
    } catch (error) {
        console.log("Error in deleteAccount controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const downloadFlag = async (req,res)=>{
    try {
        const userId = req.user._id;
        const updatedUser = await User.findByIdAndUpdate(userId, { hasDownloadedKey: true }, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Flag updated successfully" });
    }catch(error){
        console.log("Error in downloadFlag controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };