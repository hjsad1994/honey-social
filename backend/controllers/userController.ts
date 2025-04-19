import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose, { Types } from "mongoose";
import { Request, Response } from "express";
import { IUser } from "../types/user.js";
import { CloudinaryUploadOptions, CloudinaryUploadResponse, CloudinaryInfo } from "../types/cloudinary.js";

// Simplified function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
        // Extract the filename part of the URL (after last slash, before any query params)
        const fullPath = url.split('/').pop()?.split('?')[0] || '';
        
        // Remove the file extension if present
        const publicId = fullPath.includes('.') 
            ? fullPath.substring(0, fullPath.lastIndexOf('.')) 
            : fullPath;
            
        // Get the folder path from the URL (between /upload/ and filename)
        const folderMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)\/[^\/]+$/);
        const folder = folderMatch ? folderMatch[1] : '';
        
        // Combine folder and filename for complete public_id
        const completePath = folder ? `${folder}/${publicId}` : publicId;
        
        console.log("Extracted public_id:", completePath);
        return completePath;
    } catch (error) {
        console.error("Simple extraction failed, using URL as fallback");
        // As a fallback, use the URL path after /upload/
        const fallbackMatch = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
        return fallbackMatch ? fallbackMatch[1].split('.')[0] : null;
    }
};

const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    // get user profile by username or user ID
    const { query } = req.params;
    
    try {
        let user;
        if (mongoose.Types.ObjectId.isValid(query)) {
            user = await User.findOne({ _id: query }).select("-password").select("-updateAt");
        } else {
            // query is username
            user = await User.findOne({ username: query }).select("-password").select("-updateAt");
        }

        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        
        res.status(200).json({ user });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in getUserProfile controller", err.message);
    }
};

// User registration
const signupUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, username, password } = req.body;
        
        const user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            res.status(400).json({ error: "Email or username already exists" });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
        });
        
        await newUser.save();

        if (newUser) {
            generateTokenAndSetCookie(newUser._id.toString(), res);
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).json({ error: "invalid user data" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in signupUser controller", err.message);
    }
};

const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) {
            res.status(400).json({ error: "invalid username or password" });
            return;
        }
        
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        
        if (!isPasswordCorrect) {
            res.status(400).json({ error: "invalid username or password" });
            return;
        }
        
        generateTokenAndSetCookie(user._id.toString(), res);
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
            isAdmin: user.isAdmin, // Make sure this field is included
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in loginUser controller", err.message);
    }
};

const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        res.cookie("jwt", "", { maxAge: 1 });
        res.status(200).json({ error: "logged out successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in logoutUser controller", err.message);
    }
};

const followUnfollowUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const currentUserId = req.user?._id;
        
        if (!currentUserId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        if (id === currentUserId.toString()) {
            res.status(400).json({ error: "you cannot follow/unfollow yourself" });
            return;
        }
        
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(currentUserId);
        
        if (!userToModify || !currentUser) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        
        const isFollowing = currentUser.following.includes(id);
        
        if (isFollowing) {
            // Unfollow user
            await User.findByIdAndUpdate(currentUserId, { $pull: { following: id } });
            await User.findByIdAndUpdate(id, { $pull: { followers: currentUserId } });
            res.status(200).json({ error: "unfollowed successfully" });
        } else {
            // Follow user
            await User.findByIdAndUpdate(currentUserId, { $push: { following: id } });
            await User.findByIdAndUpdate(id, { $push: { followers: currentUserId } });
            res.status(200).json({ error: "followed successfully" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in followUnfollowUser controller", err.message);
    }
};

const updateUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user?._id;
    
    if (!userId) {
        res.status(401).json({ error: "Authentication required" });
        return;
    }
    
    try {
        // Find user and validate existence
        let user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        
        // Authorize user
        if (req.params.id !== userId.toString()) {
            res.status(401).json({ error: "Not authorized to update this profile" });
            return;
        }
        
        // Handle password update if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        
        // Track Cloudinary upload metadata
        let cloudinaryInfo: CloudinaryInfo | null = null;
        
        // Process profile picture if it's a new image
        if (user.profilePic && profilePic && profilePic.startsWith('data:image')) {
            try {
                const publicId = extractPublicIdFromUrl(user.profilePic);
                
                if (publicId) {
                    console.log(`Deleting previous image: ${publicId}`);
                    
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log("Previous image deleted successfully");
                    } catch (err) {
                        console.log("Could not delete previous image:", err);
                    }
                }
            } catch (err) {
                console.log("Error in image deletion process:", err);
            }
        }
        
        if (profilePic && profilePic.startsWith('data:image')) {
            try {
                // Set upload options with unique identifiers
                const uploadOptions: CloudinaryUploadOptions = {
                    folder: "user_avatars",
                    public_id: `user_${userId}_${Date.now()}`,
                    overwrite: true,
                    invalidate: true,
                    resource_type: "image"
                };
                
                // Upload new image
                const uploadedResponse = await cloudinary.uploader.upload(
                    profilePic, 
                    uploadOptions
                ) as CloudinaryUploadResponse;
                
                // Update profilePic
                profilePic = uploadedResponse.secure_url;
                
                // Store metadata for response
                cloudinaryInfo = {
                    url: profilePic,
                    public_id: uploadedResponse.public_id,
                    format: uploadedResponse.format,
                    width: uploadedResponse.width,
                    height: uploadedResponse.height,
                    bytes: uploadedResponse.bytes,
                    resource_type: uploadedResponse.resource_type,
                    timestamp: Date.now()
                };
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError);
                res.status(500).json({ error: "Failed to upload profile image" });
                return;
            }
        } else {
            // If no new valid profilePic is provided, keep the existing one
            profilePic = user.profilePic;
        }

        // Update user fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.profilePic = profilePic;
        
        // Save updated user
        user = await user.save();
        
        // Update replies in posts
        await Post.updateMany(
            { "replies.userId": userId },
            {
                $set: {
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic": user.profilePic,
                },
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        );
        
        // Send response
        res.status(200).json({ 
            error: "Profile updated successfully", 
            user,
            cloudinaryInfo 
        });
    } catch (err: any) {
        console.log("Error in updateUser controller:", err.message);
        res.status(500).json({ error: err.message || "Failed to update profile" });
    }
};

export { 
    signupUser, 
    loginUser, 
    logoutUser, 
    followUnfollowUser, 
    updateUser, 
    getUserProfile 
};