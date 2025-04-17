import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types/user.js';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface JwtPayload {
    userId: string;
}

const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            res.status(401).json({ error: "Unauthorized - please login" });
            return;
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        // Check if user exists
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(401).json({ error: "Unauthorized - user not found" });
            return;
        }
        
        // Set user in request
        req.user = user;
        next();
    } catch (err: any) {
        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            res.status(401).json({ error: "Invalid token" });
            return;
        } else if (err.name === 'TokenExpiredError') {
            res.status(401).json({ error: "Token expired" });
            return;
        }
        
        res.status(500).json({ error: err.message });
        console.log("Error in protectRoute middleware:", err.message);
    }
};

export default protectRoute;
