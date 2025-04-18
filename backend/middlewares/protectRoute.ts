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
        let token: string | undefined;

        // Check for token in cookies
        if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        // Check for token in Authorization header
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            console.log('No token provided');
            res.status(401).json({ error: "Unauthorized - Token not provided" });
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        console.log('Decoded token:', decoded);

        // Check if user exists
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            console.log('User not found for token');
            res.status(401).json({ error: "Unauthorized - User not found" });
            return;
        }

        // Set user in request
        req.user = user;
        next();
    } catch (err: any) {
        if (err.name === 'JsonWebTokenError') {
            console.log('Invalid token');
            res.status(401).json({ error: "Invalid token" });
            return;
        } else if (err.name === 'TokenExpiredError') {
            console.log('Token expired');
            res.status(401).json({ error: "Token expired" });
            return;
        }

        console.error("Error in protectRoute middleware:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export default protectRoute;
