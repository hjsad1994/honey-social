import { Request, Response } from 'express';
import fetch from 'node-fetch';
import Report from '../models/reportModel.js';
import Post from '../models/postModel.js';

// Hàm gọi webhook đã có sẵn trong code của bạn
export const checkContent = async (text: string, postId?: string, postedBy?: string): Promise<any> => {
  try {
    console.log("Kiểm tra nội dung:", text);
    console.log("postId:", postId);
    console.log("postedBy:", postedBy); 
    
    const webhookUrl = process.env.N8N_MODERATION_WEBHOOK_URL;
    
    if (!webhookUrl) {
      throw new Error('Moderation webhook URL is not configured.');
    }

    // Tạo object riêng cho request body
    const requestBody: any = { text };
    
    // Thêm postId vào request body nếu có
    if (postId) {
      requestBody.postId = postId;
    }
    
    if (postedBy) {
      requestBody.postedBy = postedBy;
    }
    
    console.log("Request body trước khi gửi:", JSON.stringify(requestBody));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Lỗi kiểm tra nội dung:', error);
    throw error;
  }
};

// Thêm vào file moderationController.ts
// Hàm phân tích kết quả kiểm duyệt và quyết định có tạo báo cáo hay không
export const analyzeModerationResult = async (text: string, postId: string, postedBy?: string): Promise<void> => {
  try {
    const moderationResults = await checkContent(text, postId, postedBy);
    
    if (!moderationResults || !Array.isArray(moderationResults) || moderationResults.length === 0) {
      console.log("Không nhận được kết quả kiểm duyệt hợp lệ");
      return;
    }
    
    const result = moderationResults[0]; // Lấy kết quả đầu tiên
    
    // Kiểm tra định dạng phản hồi mới
    if (result.flagged) {
      // Tìm mức độ vi phạm cao nhất
      let highestScore = 0;
      let mostSevereViolation = "";
      
      // Dựa vào cấu trúc mới có thể là scores thay vì category_scores
      const scoreObj = result.scores || result.category_scores;
      
      if (!scoreObj) {
        console.log("Không tìm thấy điểm số vi phạm trong kết quả");
        return;
      }
      
      Object.entries(scoreObj).forEach(([category, score]) => {
        if (typeof score === 'number' && score > highestScore) {
          highestScore = score;
          mostSevereViolation = category;
        }
      });
      
      // Tạo báo cáo vi phạm
      const post = await Post.findById(postId);
      if (!post) {
        console.log("Không tìm thấy bài viết:", postId);
        return;
      }
      
      // Xác định mức độ nghiêm trọng dựa trên điểm cao nhất
      const severity = highestScore > 0.8 ? 'high' : highestScore > 0.5 ? 'medium' : 'low';
      
      // Tạo báo cáo mới
      const newReport = new Report({
        postId: post._id,
        postContent: text,
        reportedBy: 'system',
        reportedByUsername: 'Hệ thống tự động', // Thêm trường này
        moderationResult: result,
        severity: severity
      });
      
      await newReport.save();
      console.log(`Đã tạo báo cáo vi phạm cho bài viết ${postId}, mức độ: ${severity}`);
    } else {
      console.log("Nội dung không vi phạm chính sách");
    }
  } catch (error) {
    console.error("Lỗi khi phân tích kết quả kiểm duyệt:", error);
  }
};

// Thêm hàm này vào controller
export const checkContentRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Request headers:", JSON.stringify(req.headers));
    console.log("Request body:", req.body);
    
    // Kiểm tra nếu body không tồn tại
    if (!req.body) {
      res.status(400).json({ error: 'Request body is missing' });
      return;
    }
    
    // Trường hợp 1: Nhận được kết quả trực tiếp từ OpenAI qua n8n (không có text)
    if (req.body.flagged !== undefined && !req.body.text) {
      console.log("Nhận được kết quả kiểm duyệt từ n8n");
      
      // Kiểm tra nếu nội dung không vi phạm (flagged: false)
      if (req.body.flagged === false) {
        // console.log("Nội dung không vi phạm chính sách");
        res.status(200).json({ 
          success: true, 
          message: "Content is acceptable",
          flagged: false
        });
        return;
      }
      
      // Ưu tiên tìm postId trong request body, sau đó mới tìm trong query params hoặc headers
      const postIdParam = req.body.postId || req.query.postId || req.headers['x-post-id'];
      
      if (postIdParam) {
        const postId = Array.isArray(postIdParam) ? postIdParam[0] : postIdParam;
        console.log(`Tìm thấy postId: ${postId}, đang tìm bài viết...`);
        
        // Tìm bài đăng
        const post = await Post.findById(postId);
        if (post) {
          console.log(`Tìm thấy bài viết với ID: ${post._id}`);
          // Tạo báo cáo vi phạm
          const severity = calculateSeverity(req.body.category_scores);
          
          const newReport = new Report({
            postId: post._id,
            postContent: post.text || "",
            reportedBy: 'system',
            reportedByUsername: 'Hệ thống tự động',
            moderationResult: {
              flagged: req.body.flagged,
              categories: req.body.categories,
              category_scores: req.body.category_scores
            },
            severity: severity
          });
          
          await newReport.save();
          console.log(`Đã tạo báo cáo vi phạm cho bài viết ${post._id}`);
          res.status(200).json({ success: true, message: "Báo cáo đã được tạo thành công" });
          return;
        } else {
          console.log(`Không tìm thấy bài viết với ID: ${postId}`);
        }
      } else {
        console.log("Không tìm thấy postId trong request");
      }
      
      // Trả về phản hồi thành công nếu không tìm thấy postId hoặc post
      res.status(200).json({ 
        success: true, 
        message: "Moderation results received successfully",
        result: {
          flagged: req.body.flagged,
          categories: req.body.categories,
          category_scores: req.body.category_scores
        }
      });
      return;
    }
    
    // Trường hợp 2: API được gọi thông thường với text để kiểm duyệt
    const text = req.body.text;
    const postId = req.body.postId;
    const postedBy = req.body.postedBy;
    
    if (!text) {
      res.status(400).json({ error: 'Text content is required.' });
      return;
    }
    
    console.log("Received request with text:", text);
    
    const result = await checkContent(text, postId, postedBy);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in checkContentRoute:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

// Hàm tính mức độ nghiêm trọng
function calculateSeverity(scores: Record<string, number> | undefined): string {
  if (!scores) return 'medium';
  
  const values = Object.values(scores);
  if (!values.length) return 'medium';
  
  const highestScore = Math.max(...values);
  return highestScore > 0.8 ? 'high' : highestScore > 0.5 ? 'medium' : 'low';
}

// Get all reports (admin only)
export const getAllReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate('postId');
      
    res.status(200).json(reports);
  } catch (error: any) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

// Admin action on report
export const handleReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reportId, action } = req.body;
    
    if (!reportId || !action) {
      res.status(400).json({ error: 'Report ID and action are required.' });
      return;
    }
    
    const report = await Report.findById(reportId);
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }
    
    if (action === 'delete') {
      // Delete the post
      await Post.findByIdAndDelete(report.postId);
      report.status = 'resolved';
      report.resolution = 'deleted';
      await report.save();
      res.status(200).json({ message: 'Post deleted successfully' });
    } else if (action === 'ignore') {
      // Mark report as resolved but keep the post
      report.status = 'resolved';
      report.resolution = 'ignored';
      await report.save();
      res.status(200).json({ message: 'Report marked as resolved' });
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error: any) {
    console.error('Error in handleReport:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const createUserReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId, reason, content, customReason } = req.body;
    
    // Các validation checks...

    // Tìm bài viết
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      return;
    }

    // Lưu thêm thông tin username của người báo cáo
    let reporterInfo = {
      id: 'system',
      username: 'Hệ thống tự động'
    };
    
    if (req.user) {
      reporterInfo = {
        id: req.user._id.toString(),
        username: req.user.username || 'Unknown user'
      };
    }

    // Xác định mức độ nghiêm trọng dựa trên loại báo cáo
    let severity = 'medium';
    if (['violence', 'hate'].includes(reason)) {
      severity = 'high';
    } else if (['spam'].includes(reason)) {
      severity = 'low';
    }
    
    // Tạo báo cáo mới với thông tin người báo cáo đầy đủ
    const newReport = new Report({
      postId: post._id,
      postContent: content || post.text || "",
      reportedBy: reporterInfo.id,
      reportedByUsername: reporterInfo.username, // Thêm trường này vào model Report
      reason: reason === "other" ? customReason : reason,
      severity: severity,
      status: 'pending',
      moderationResult: {
        flagged: true,
        categories: { 
          [reason]: true
        },
        source: reporterInfo.id === 'system' ? 'system' : 'user-report',
        userDescription: reason === "other" ? customReason : undefined
      }
    });
    
    await newReport.save();
    
    res.status(201).json({ success: true, message: 'Báo cáo đã được gửi thành công.' });
  } catch (error: any) {
    console.error('Lỗi trong createUserReport:', error);
    res.status(500).json({ error: 'Lỗi máy chủ: ' + error.message });
  }
};