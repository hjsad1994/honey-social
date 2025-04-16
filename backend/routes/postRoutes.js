import express from 'express'
import { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, likeUnlikeReply, deleteReply } from '../Controllers/PostController.js'
import protectRoute from '../middlewares/protectRoute.js'
const router = express.Router()

router.get("/feed", protectRoute, getFeedPosts)

router.get("/:id", getPost)
router.get("/user/:username", getUserPosts)

router.post("/create", protectRoute, createPost)
router.delete("/:id", protectRoute, deletePost)
router.put("/like/:id", protectRoute, likeUnlikePost)
// Fix the route order - more specific routes should come first
router.put("/reply/like/:id", protectRoute, likeUnlikeReply)
router.put("/reply/:id", protectRoute, replyToPost)
// Add a new route for deleting replies
router.delete("/:id/replies/:replyId", protectRoute, deleteReply)

export default router