# Honey Social Media Platform

![Honey Logo](https://github.com/hjsad1994/honey-social/blob/main/frontend/public/dark-logo.svg)

Honey là một nền tảng mạng xã hội hiện đại, cho phép người dùng kết nối, chia sẻ bài viết kèm hình ảnh, theo dõi người dùng khác và tương tác qua lượt thích cũng như phản hồi.

## Tính Năng

- **Xác Thực Người Dùng:** Đăng ký, đăng nhập và đăng xuất.
- **Hồ Sơ Người Dùng:** Hồ sơ cá nhân có thể tùy chỉnh với ảnh đại diện và tiểu sử.
- **Hệ Thống Feed:** Xem bài viết từ những người dùng mà mình theo dõi.
- **Tạo Bài Viết:** Tạo bài viết chứa nội dung văn bản với tùy chọn kèm hình ảnh.
- **Tương Tác:** Thích bài viết và thêm phản hồi.
- **Hệ Thống Theo Dõi:** Theo dõi hoặc bỏ theo dõi người dùng.
- **Chế Độ Giao Diện Tối/Sáng:** Giao diện có thể chuyển đổi giữa chế độ tối và sáng.
- **Thiết Kế Responsive:** Tối ưu hiển thị trên nhiều kích cỡ màn hình khác nhau.

## Công Nghệ Sử Dụng

### Frontend
- **React 19** với **React Router DOM**
- **Redux Toolkit** cho quản lý trạng thái
- **Chakra UI** cho giao diện người dùng
- **Vite** làm công cụ xây dựng và máy chủ phát triển

### Backend
- **Express.js** làm API server
- **MongoDB** sử dụng Mongoose cho cơ sở dữ liệu
- **JWT** cho xác thực người dùng
- **Cloudinary** cho lưu trữ và tối ưu hình ảnh
- **bcryptjs** để mã hóa mật khẩu

## Cài Đặt

### Yêu Cầu
- Node.js (phiên bản 16 trở lên)
- MongoDB
- Tài khoản Cloudinary

### Thiết Lập
1. **Clone Repository:**
   ```bash
   git clone https://github.com/username/honey-social.git
   cd honey-social
