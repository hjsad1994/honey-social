import express from 'express'
import { createPost, getPost, deletePost } from '../Controllers/PostController.js'
import protectRoute from '../middlewares/protectRoute.js'
const router = express.Router()

router.get("/:id", getPost)
router.post("/create", protectRoute, createPost)
router.delete("/:id", deletePost)
export default router