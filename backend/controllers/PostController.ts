import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { Types } from "mongoose";
import { IPost, IReply } from "../types/post.js";
import { CloudinaryUploadOptions, CloudinaryUploadResponse } from "../types/cloudinary.js";

// Utility function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
        // Extract folder path and filename
        const regex = /\/v\d+\/([^/]+\/[^.]+)/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            return match[1];
        }
        
        // Fallback approach
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        
        const folderMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)\/[^\/]+$/);
        const folder = folderMatch ? folderMatch[1] : '';
        
        return folder ? `${folder}/${filename}` : filename;
    } catch (error) {
        console.error("Failed to extract public ID:", error);
        return null;
    }
};

const createPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { postedBy, text, img } = req.body;
        
        // Validate required fields
        if (!postedBy || (!text && !img)) {
            res.status(400).json({ error: "Need content or image to create post" });
            return;
        }
        
        const user = await User.findById(postedBy);
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        
        if (user._id.toString() !== req.user?._id?.toString()) {
            res.status(400).json({ error: "user not authorized to create post" });
            return;
        }
        
        // Check text length
        const maxLength = 500;
        if (text && text.length > maxLength) {
            res.status(400).json({ error: `text should be less than ${maxLength} characters` });
            return;
        }

        // Prepare post data
        const postData: Partial<IPost> = {
            postedBy: new Types.ObjectId(postedBy),
            text: text || "",
        };

        // Upload image if provided
        if (img && img.startsWith('data:image')) {
            try {
                const uploadOptions: CloudinaryUploadOptions = {
                    folder: "honey_posts",
                    public_id: `post_${postedBy}_${Date.now()}`,
                    overwrite: true,
                    resource_type: "image",
                    quality: "auto",
                    fetch_format: "auto",
                    flags: "preserve_transparency",
                    chunk_size: 10000000
                };
                
                const uploadedResponse = await cloudinary.uploader.upload(
                    img, 
                    uploadOptions
                ) as CloudinaryUploadResponse;
                
                postData.img = uploadedResponse.secure_url;
                
                console.log("Image uploaded to Cloudinary:", uploadedResponse.secure_url);
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError);
                res.status(500).json({ error: "Failed to upload image" });
                return;
            }
        }

        // Create and save post
        const newPost = await Post.create(postData);
        await newPost.save();
        
        res.status(201).json({ error: "post created successfully", post: newPost });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in createPost controller", err.message);
    }
};

const getPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            res.status(404).json({ error: "post not found" });
            return;
        }
        res.status(200).json(post);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in getPost controller", err.message);
    }
};

const deletePost = async (req: Request, res: Response): Promise<void> => {
    const { imageUrl } = req.body;
    
    try {
        // Find the post
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            res.status(404).json({ error: "post not found" });
            return;
        }
        
        // Check authorization
        if (post.postedBy.toString() !== req.user?._id?.toString()) {
            res.status(401).json({ error: "user not authorized to delete post" });
            return;
        }
        
        // Delete image from Cloudinary if it exists
        if (post.img && post.img.includes('cloudinary.com')) {
            try {
                const publicId = extractPublicIdFromUrl(post.img);
                
                if (publicId) {
                    console.log(`Deleting post image from Cloudinary: ${publicId}`);
                    
                    const result = await cloudinary.uploader.destroy(publicId);
                    console.log("Cloudinary deletion result:", result);
                }
            } catch (cloudinaryError) {
                console.log("Error deleting image from Cloudinary:", cloudinaryError);
                // Continue with post deletion even if image deletion fails
            }
        }
        
        // Delete the post
        await Post.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ error: "post deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in deletePost controller", err.message);
    }
};

const likeUnlikePost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id: postId } = req.params;
        const userId = req.user?._id;
        
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "post not found" });
            return;
        }
        
        const userLikedPost = post.likes.some(id => id.toString() === userId.toString());
        
        if (userLikedPost) {
            // unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
            res.status(200).json({ error: "post unliked successfully" });
        } else {
            // like post
            await Post.updateOne({ _id: postId }, { $push: { likes: userId } });
            res.status(200).json({ error: "post liked successfully" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in likeUnlikePost controller", err.message);
    }
};

const replyToPost = async (req: Request, res: Response): Promise<void> => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user?._id;
        const userProfilePic = req.user?.profilePic;
        const username = req.user?.username;
        
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        if (!text) {
            res.status(400).json({ error: "text is required" });
            return;
        }
        
        const post = await Post.findById(postId);
        if (!post) {
            res.status(404).json({ error: "post not found" });
            return;
        }
        
        const reply: IReply = {
            userId: new Types.ObjectId(userId.toString()),
            text,
            userProfilePic,
            username,
            likes: [],
            createdAt: new Date()
        };
        
        post.replies.push(reply);
        await post.save();
        
        res.status(200).json({ error: "reply added successfully", post });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in replyToPost controller", err.message);
    }
};

const likeUnlikeReply = async (req: Request, res: Response): Promise<void> => {
    try {
        const replyId = req.params.id;
        const userId = req.user?._id;
        
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        // Find the post containing this reply
        const post = await Post.findOne({ "replies._id": replyId });
        
        if (!post) {
            res.status(404).json({ error: "Reply not found" });
            return;
        }
        
        // Find the specific reply
        const replyIndex = post.replies.findIndex(reply => reply._id?.toString() === replyId);
        
        if (replyIndex === -1) {
            res.status(404).json({ error: "Reply not found" });
            return;
        }
        
        const reply = post.replies[replyIndex];
        
        // Check if user has already liked this reply
        const userLikedReply = reply.likes.some(id => id.toString() === userId.toString());
        
        if (userLikedReply) {
            // Unlike the reply
            reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
            await post.save();
            res.status(200).json({ error: "reply unliked successfully" });
        } else {
            // Like the reply
            reply.likes.push(new Types.ObjectId(userId.toString()));
            await post.save();
            res.status(200).json({ error: "reply liked successfully" });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in likeUnlikeReply controller", err.message);
    }
};

const deleteReply = async (req: Request, res: Response): Promise<void> => {
    try {
        const postId = req.params.id;
        const replyId = req.params.replyId;
        const userId = req.user?._id;
        
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        // Find the post
        const post = await Post.findById(postId);
        
        if (!post) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        
        // Find the reply
        const reply = post.replies.find(reply => reply._id?.toString() === replyId);
        
        if (!reply) {
            res.status(404).json({ error: "Reply not found" });
            return;
        }
        
        // Check authorization
        if (reply.userId.toString() !== userId.toString()) {
            res.status(401).json({ error: "Not authorized to delete this reply" });
            return;
        }
        
        // Remove the reply
        post.replies = post.replies.filter(reply => reply._id?.toString() !== replyId);
        
        // Save the updated post
        await post.save();
        
        res.status(200).json({ error: "reply deleted successfully" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("Error in deleteReply controller", err.message);
    }
};

const getFeedPosts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        
        const following = user.following;
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });
        
        res.status(200).json(feedPosts);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
        console.log("error in getFeedPosts controller", err.message);
    }
};

const getUserPosts = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).json({ error: "user not found" });
            return;
        }
        
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });
        if (!posts) {
            res.status(404).json({ error: "posts not found" });
            return;
        }
        
        res.status(200).json(posts);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    } 
};

export { 
    createPost, 
    getPost, 
    deletePost, 
    likeUnlikePost, 
    replyToPost, 
    getFeedPosts, 
    getUserPosts, 
    likeUnlikeReply, 
    deleteReply 
};