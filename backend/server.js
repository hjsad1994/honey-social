import express from 'express'
import dotenv from 'dotenv'
import connectDB from './db/connectDB.js'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'

import {v2 as cloudinary} from 'cloudinary'

dotenv.config()
connectDB();
const app = express()
const PORT = process.env.PORT || 5000 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// middlewares
app.use(express.json({ limit: '50mb' })) // to parse json data in the req.body
app.use(express.urlencoded({extended: true})) // to parse form data in the req.body
app.use(cookieParser()) // to parse cookies in the req.cookies

// routes
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)

app.listen(5000, () => console.log(`server started at http://localhost:${PORT}`))