import jwt from 'jsonwebtoken';
import { Response } from 'express';

const generateTokenAndSetCookie = (userId: string, res: Response): string => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET as string,  {
        expiresIn: '15d',
    });

    res.cookie('jwt', token, {
        httpOnly: true, // to prevent XSS attacks
        secure: process.env.NODE_ENV === 'production', 
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: 'strict', // to prevent CSRF attacks
    });
    
    return token;
};

export default generateTokenAndSetCookie;