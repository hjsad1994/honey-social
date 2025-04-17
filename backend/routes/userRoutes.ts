import express, { Router } from 'express';
import { signupUser, loginUser, logoutUser, followUnfollowUser, updateUser, getUserProfile } from '../controllers/userController.js';
import { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, likeUnlikeReply, deleteReply } from '../controllers/PostController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router: Router = express.Router();

router.get("/profile/:query", getUserProfile);

router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.put("/update/:id", protectRoute, updateUser);

export default router;