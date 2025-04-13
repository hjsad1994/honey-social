import User from "../models/userModel.js"
import jwt from "jsonwebtoken"
const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        if (!token) {
            return res.status(401).json({ message: "unauthorized" })
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // verify token
        const user = await User.findById(decoded.userId).select("-password") // exclude password from user object
        req.user = user // attach user to req object

        next() // call next middleware or route handler
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log("error in protectRoute middleware", err.message)
    }
}

export  default protectRoute