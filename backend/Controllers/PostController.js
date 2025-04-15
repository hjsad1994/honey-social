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
        res.status(200).json({ post })
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in getPost controller", err.message)
    }
}
const deletePost = async (req, res) => {
    let {profilePic} = req.body
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ error: "post not found" })
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "user not authorized to delete post" })
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({ error: "post deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: err.message })
        console.log("error in deletePost controller", err.message)
    }
}
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
export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts }