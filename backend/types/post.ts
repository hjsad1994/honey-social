import { Document, Types } from 'mongoose';

export interface IReply {
  userId: Types.ObjectId;
  text: string;
  userProfilePic?: string;
  username?: string;
  likes: Types.ObjectId[];
  createdAt: Date;
  _id?: Types.ObjectId;
}

export interface IPost extends Document {
  postedBy: Types.ObjectId;
  text?: string;
  img?: string;
  likes: Types.ObjectId[];
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}