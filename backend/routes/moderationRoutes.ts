import express from 'express';
import { 
  getAllReports, 
  handleReport,
  checkContentRoute // Thêm hàm mới này
} from '../controllers/moderationController.js';
import protectRoute from '../middlewares/protectRoute.js';

const router = express.Router();

// Thêm endpoint gốc cho kiểm duyệt nội dung
router.post('/', checkContentRoute);

// Admin routes
router.get('/reports', protectRoute, getAllReports);
router.post('/reports/handle', protectRoute, handleReport);

export default router;