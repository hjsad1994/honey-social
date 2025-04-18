import express from 'express';
import { sendChatMessage } from '../controllers/chatController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

router.post('/send', sendChatMessage);

export default router;