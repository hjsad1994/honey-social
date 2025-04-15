import User from "../models/userModel.js"
import bcrypt from "bcryptjs"
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js"
import { v2 as cloudinary } from "cloudinary"

// Simplified function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
        // Extract the filename part of the URL (after last slash, before any query params)
        const fullPath = url.split('/').pop().split('?')[0];
        
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
}

const getUserProfile = async (req, res) => {
    const { username } = req.params
    try {
        const user = await User.findOne({ username }).select("-password").select("-updateAt") // exclude password from user object
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in getUserProfile controller", err.message)
    }
}


// dang ky
const signupUser = async (req, res) => {
    try {
        const { name, email, username, password } = req.body
        const user = await User.findOne({ $or: [{ email }, { username }] })
        if (user) {
            return res.status(400).json({ error: "Email or username already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            name,
            email,
            username,
            password: hashedPassword,
        })
        await newUser.save()

        if (newUser) {
            generateTokenAndSetCookie(newUser._id, res) // set token in cookie
            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username,
                bio: newUser.bio,
                profilePic: newUser.profilePic,
            })
        } else {
            res.status(400).json({ error: "invalid user data" })
        }

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in signupUser controller", err.message)
    }
}


const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "") // check password
        if (!user || !isPasswordCorrect) {
            return res.status(400).json({ error: "invalid username or password" })
        }
        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            bio: user.bio,
            profilePic: user.profilePic,
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in loginUser controller", err.message)
    }
}
const logoutUser = async (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 1 })
        res.status(200).json({ error: "logged out successfully" })

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in logoutUser controller", err.message)
    }
}
const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params
        const userToModify = await User.findById(id)
        const CurrentUser = await User.findById(req.user._id)
        if (id === req.user._id.toString()) {
            return res.status(400).json({ error: "you cannot follow/unfollow yourself" })
        }
        if (!userToModify || !CurrentUser) {
            return res.status(404).json({ error: "user not found" })
        }
        const isFollowing = CurrentUser.following.includes(id)
        if (isFollowing) {
            // unfollow user
            // modify current user follwing
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } })
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } })
            res.status(200).json({ error: "unfollowed successfully" })
        } else {
            // Follow user
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id } })
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } })
            res.status(200).json({ error: "followed successfully" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in followUnfollowUser controller", err.message)
    }
}

const updateUser = async (req, res) => {
    const { name, email, username, password, bio } = req.body;
    let { profilePic } = req.body;
    const userId = req.user._id;
    
    try {
        // Find user and validate existence
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Authorize user
        if (req.params.id !== userId.toString()) {
            return res.status(401).json({ error: "Not authorized to update this profile" });
        }
        
        // Handle password update if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        
        // Track Cloudinary upload metadata
        let cloudinaryInfo = null;
        
        // Only process the profile picture if it's a valid base64 string that starts with data:image
        // This ensures we only try to upload when an actual new image is provided
        if (user.profilePic && profilePic && profilePic.startsWith('data:image')) {
            try {
                const publicId = extractPublicIdFromUrl(user.profilePic);
                
                if (publicId) {
                    console.log(`Deleting previous image: ${publicId}`);
                    
                    // Use a simple try-catch for deletion
                    try {
                        await cloudinary.uploader.destroy(publicId);
                        console.log("Previous image deleted successfully");
                    } catch (err) {
                        console.log("Could not delete previous image:", err.message);
                        // Continue with upload even if delete failed
                    }
                }
            } catch (err) {
                console.log("Error in image deletion process:", err.message);
                // Continue with the update process
            }
        }
        
        if (profilePic && profilePic.startsWith('data:image')) {
            try {
                // Set upload options with unique identifiers
                const uploadOptions = {
                    folder: "user_avatars",
                    public_id: `user_${userId}_${Date.now()}`,
                    overwrite: true,
                    invalidate: true,
                    resource_type: "image"
                };
                
                // Upload new image
                const uploadedResponse = await cloudinary.uploader.upload(profilePic, uploadOptions);
                
                // Update profilePic without timestamp
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
                console.error("Cloudinary upload failed:", cloudinaryError.message);
                return res.status(500).json({ error: "Failed to upload profile image" });
            }
        } else {
            // If no new valid profilePic is provided, keep the existing one
            profilePic = user.profilePic;
        }

        // Update user fields with provided values or keep existing
        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.profilePic = profilePic; // Update profilePic only if it has changed
        
        // Save updated user
        user = await user.save();
        
        // Send successful response with user data and cloudinary info
        res.status(200).json({ 
            error: "Profile updated successfully", 
            user,
            cloudinaryInfo 
        });
    } catch (err) {
        console.log("Error in updateUser controller:", err.message);
        res.status(500).json({ error: err.message || "Failed to update profile" });
    }
};

export { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile }