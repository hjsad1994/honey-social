import express, { Express } from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import moderationRoutes from './routes/moderationRoutes.js'
import { v2 as cloudinary } from 'cloudinary'
import cors from 'cors';

dotenv.config()
connectDB();
const app: Express = express()
const PORT: number = parseInt(process.env.PORT || '5000', 10)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow requests from this origin
//   credentials: true, // Allow cookies and other credentials
// }));
// HOẶC cho phép cụ thể ngrok domain
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://6dba-2405-4803-c86a-6d50-2541-2b40-282f-a37e.ngrok-free.app'
  ],
  credentials: true,
}));
// middlewares
app.use(express.json({ limit: '50mb' })) // to parse json data in the req.body
app.use(express.urlencoded({ extended: true })) // to parse form data in the req.body
app.use(cookieParser()) // to parse cookies in the req.cookies

// Thêm middleware này trước khi xác định routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200));
  }
  next();
});

// routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/moderation", moderationRoutes)

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))
