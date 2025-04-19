import express from "express";
import {
  getAllReports,
  handleReport,
  checkContentRoute,
  createUserReport, // Thêm hàm mới này
} from "../controllers/moderationController.js";
import  {protectRoute, isAdmin}  from "../middlewares/protectRoute.js";

const router = express.Router();

// Thêm endpoint gốc cho kiểm duyệt nội dung
router.post("/", checkContentRoute);

// Thêm route cho phép người dùng báo cáo
router.post("/report", protectRoute, createUserReport);

// Admin routes
router.get("/reports", protectRoute, isAdmin,getAllReports);
router.post("/reports/handle", protectRoute, isAdmin,handleReport);

export default router;
