import User from "../models/userModel.js"
import Post from "../models/postModel.js"
import { v2 as cloudinary } from "cloudinary"

const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body
        
        // Kiểm tra xem có ít nhất text hoặc img
        if (!postedBy || (!text && !img)) {
            return res.status(400).json({ error: "Cần có nội dung hoặc hình ảnh để tạo bài viết" })
        }
        
        const user = await User.findById(postedBy)
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "user not authorized to create post" })
        }
        
        // Kiểm tra độ dài văn bản nếu có
        const maxLength = 500
        if (text && text.length > maxLength) {
            return res.status(400).json({ error: `text should be less than ${maxLength} characters` })
        }

        // Chuẩn bị dữ liệu bài viết
        const postData = {
            postedBy,
            text: text || "",
        }

        // Upload ảnh lên Cloudinary nếu có
        if (img && img.startsWith('data:image')) {
            try {
                // Cấu hình options upload với ID duy nhất và quality settings
                const uploadOptions = {
                    folder: "honey_posts",
                    public_id: `post_${postedBy}_${Date.now()}`,
                    overwrite: true,
                    resource_type: "image",
                    quality: "auto", // Let Cloudinary optimize quality
                    fetch_format: "auto", // Optimize format automatically 
                    flags: "preserve_transparency", // Preserve transparency in PNGs
                    chunk_size: 10000000 // 10MB chunks for better handling of large images
                };
                
                // Upload ảnh lên Cloudinary
                const uploadedResponse = await cloudinary.uploader.upload(img, uploadOptions);
                
                // Lưu URL Cloudinary vào postData
                postData.img = uploadedResponse.secure_url;
                
                console.log("Image uploaded to Cloudinary:", uploadedResponse.secure_url);
            } catch (cloudinaryError) {
                console.error("Cloudinary upload failed:", cloudinaryError);
                return res.status(500).json({ error: "Failed to upload image" });
            }
        }

        // Tạo và lưu bài viết
        const newPost = await Post.create(postData)
        await newPost.save()
        
        res.status(201).json({ error: "post created successfully", post: newPost })
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in createPost controller", err.message)
    }
}

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ error: "post not found" })
        }
        res.status(200).json( post )
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in getPost controller", err.message)
    }
}

// Updated deletePost function
const deletePost = async (req, res) => {
    const { imageUrl } = req.body;
    
    try {
        // Find the post first
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ error: "post not found" });
        }
        
        // Check authorization
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "user not authorized to delete post" });
        }
        
        // Delete image from Cloudinary if it exists
        if (post.img && post.img.includes('cloudinary.com')) {
            try {
                // Extract the public ID from the Cloudinary URL
                const publicId = extractPublicIdFromUrl(post.img);
                
                if (publicId) {
                    console.log(`Deleting post image from Cloudinary: ${publicId}`);
                    
                    const result = await cloudinary.uploader.destroy(publicId);
                    console.log("Cloudinary deletion result:", result);
                }
            } catch (cloudinaryError) {
                console.log("Error deleting image from Cloudinary:", cloudinaryError.message);
                // Continue with post deletion even if image deletion fails
            }
        }
        
        // Delete the post from database
        await Post.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ error: "post deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("error in deletePost controller", err.message);
    }
};

// Add this utility function to extract public ID from Cloudinary URL
const extractPublicIdFromUrl = (url) => {
    if (!url || !url.includes('cloudinary.com')) return null;
    
    try {
        // Extract folder path and filename
        const regex = /\/v\d+\/([^/]+\/[^.]+)/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            return match[1];
        }
        
        // Fallback approach: get everything after the last slash and before extension
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1].split('.')[0];
        
        // Get folder name from URL
        const folderMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)\/[^\/]+$/);
        const folder = folderMatch ? folderMatch[1] : '';
        
        return folder ? `${folder}/${filename}` : filename;
    } catch (error) {
        console.error("Failed to extract public ID:", error);
        return null;
    }
};

const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.user._id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "post not found" })
        }
        const userLikedPost = post.likes.includes(userId)
        if (userLikedPost) {
            // unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(200).json({ error: "post unliked successfully" })
        } else {
            // like post
            await Post.updateOne({ _id: postId }, { $push: { likes: userId } })
            res.status(200).json({ error: "post liked successfully" })
        }
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in likeUnlikePost controller", err.message)
    }

}
const replyToPost = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id
        const useProfilePic = req.user.profilePic
        const username = req.user.username
        if (!text) {
            return res.status(400).json({ error: "text is required" })
        }
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "post not found" })
        }
        const reply = { userId, text, useProfilePic, username }
        post.replies.push(reply)
        await post.save()
        res.status(200).json({ error: "reply added successfully", post })

    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in replyToPost controller", err.message)
    }
}
const likeUnlikeReply = async (req, res) => {
    try {
        const replyId = req.params.id;
        const userId = req.user._id;
        
        // Find the post containing this reply
        const post = await Post.findOne({ "replies._id": replyId });
        
        if (!post) {
            return res.status(404).json({ error: "Reply not found" });
        }
        
        // Find the specific reply
        const replyIndex = post.replies.findIndex(reply => reply._id.toString() === replyId);
        
        if (replyIndex === -1) {
            return res.status(404).json({ error: "Reply not found" });
        }
        
        const reply = post.replies[replyIndex];
        
        // Initialize likes array if it doesn't exist
        if (!reply.likes) {
            reply.likes = [];
        }
        
        // Check if user has already liked this reply
        const userLikedReply = reply.likes.includes(userId);
        
        if (userLikedReply) {
            // Unlike the reply
            reply.likes = reply.likes.filter(id => id.toString() !== userId.toString());
            await post.save();
            res.status(200).json({ error: "reply unliked successfully" });
        } else {
            // Like the reply
            reply.likes.push(userId);
            await post.save();
            res.status(200).json({ error: "reply liked successfully" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
        console.log("error in likeUnlikeReply controller", err.message);
    }
};
const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        const following = user.following
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 })
        res.status(200).json( feedPosts )
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in getFeedPosts controller", err.message)
    }
}

const getUserPosts = async (req, res) => {
    const { username} = req.params
    try {
        const user = await User.findOne( { username })
        if (!user) {
            return res.status(404).json({ error: "user not found" })
        }
        const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 })
        if (!posts) {
            return res.status(404).json({ error: "posts not found" })
        }
        res.status(200).json(posts)



    } catch (error) {
        res.status(500).json({ error: error.message })
    } 
}
export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, likeUnlikeReply, getFeedPosts, getUserPosts }