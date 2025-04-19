import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  password: string;
  profilePic: string;
  followers: string[];
  following: string[];
  bio: string;
  isFrozen: boolean;
  createdAt: Date;
  updatedAt: Date;
  isAdmin?: boolean;
}