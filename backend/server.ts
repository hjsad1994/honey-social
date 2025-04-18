import express, { Express } from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
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
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from this origin
  credentials: true, // Allow cookies and other credentials
}));

// middlewares
app.use(express.json({ limit: '50mb' })) // to parse json data in the req.body
app.use(express.urlencoded({ extended: true })) // to parse form data in the req.body
app.use(cookieParser()) // to parse cookies in the req.cookies

// routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/chat", chatRoutes)

app.listen(PORT, () => console.log(`server started at http://localhost:${PORT}`))
