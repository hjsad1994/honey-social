import User from "../models/userModel.js"
import Post from "../models/postModel.js"


const createPost = async (req, res) => {
    try {
        const { postedBy, text, img } = req.body
        if(!postedBy || !text) {
            return res.status(400).json({ message: "postedBy and text are required" })
        } 
        const user = await User.findById(postedBy)
        if(!user) {
            return res.status(404).json({ message: "user not found" })
        }
        if(user._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ message: "user not authorized to create post" })
        }
        const maxLength = 500
        if(text.length > maxLength) {
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
        if(!post) {
            return res.status(404).json({ message: "post not found" })
        }
        res.status(200).json({ post })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in getPost controller", err.message)
    }
}
const deletePost = async (req, res) => {
     
}
export { createPost, getPost, deletePost }