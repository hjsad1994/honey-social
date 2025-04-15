import User from "../models/userModel.js"
import jwt from "jsonwebtoken"

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ error: "Unauthorized - please login" })
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Check if user exists
        const user = await User.findById(decoded.userId).select("-password")
        if (!user) {
            return res.status(401).json({ error: "Unauthorized - user not found" })
        }
        
        // Set user in request
        req.user = user
        next()
    } catch (err) {
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: "Invalid token" })
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: "Token expired" })
        }
        
        res.status(500).json({ error: err.message })
        console.log("Error in protectRoute middleware:", err.message)
    }
}

export default protectRoute