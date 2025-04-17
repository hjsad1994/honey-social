export interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePic: string;
  followers: string[];
  following: string[];
  bio: string;
  createdAt: string;
  updatedAt: string;
  isVerified?: boolean;
}

export interface Post {
  _id: string;
  postedBy: string | User;
  text: string;
  img?: string;
  likes: string[];
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  _id?: string;
  userId: string;
  text: string;
  userProfilePic?: string;
  image?: string | null;    // 👈 thêm
  username?: string;
  likes: string[];
  createdAt: Date;
}