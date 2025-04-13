import User from "../models/userModel.js"
import Post from "../models/postModel.js"


const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body
        if (!postedBy || !text) {
            return res.status(400).json({ message: "postedBy and text are required" })
        }
        const user = await User.findById(postedBy)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if (user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "user not authorized to create post" })
        }
        const maxLength = 500
        if (text.length > maxLength) {
            return res.status(400).json({ message: `text should be less than ${maxLength} characters` })
        }
        const newPost = await Post.create({
            postedBy,
            text,
            img,
        })
        await newPost.save()
        res.status(201).json({ message: "post created successfully", post: newPost })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in createPost controller", err.message)
    }
}

const getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        res.status(200).json({ post })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in getPost controller", err.message)
    }
}
const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        if (post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "user not authorized to delete post" })
        }
        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json({ message: "post deleted successfully" })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in deletePost controller", err.message)
    }
}
const likeUnlikePost = async (req, res) => {
    try {
        const { id: postId } = req.params
        const userId = req.user._id
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        const userLikedPost = post.likes.includes(userId)
        if (userLikedPost) {
            // unlike post
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            res.status(200).json({ message: "post unliked successfully" })
        } else {
            // like post
            await Post.updateOne({ _id: postId }, { $push: { likes: userId } })
            res.status(200).json({ message: "post liked successfully" })
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
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
            return res.status(400).json({ message: "text is required" })
        }
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "post not found" })
        }
        const reply = { userId, text, useProfilePic, username }
        post.replies.push(reply)
        await post.save()
        res.status(200).json({ message: "reply added successfully", post })

    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in replyToPost controller", err.message)
    }
}
const getFeedPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "user not found" })
        }
        const following = user.following
        const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 })
        res.status(200).json({ feedPosts })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in getFeedPosts controller", err.message)
    }
}
export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts }