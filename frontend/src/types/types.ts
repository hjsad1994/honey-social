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
  isAdmin?: boolean;
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

export interface Report {
  _id: string;
  postId: {
    _id: string;
    text: string;
    img?: string;
    postedBy: string;  // Add this missing field
  };
  postContent: string;
  status: 'pending' | 'resolved';
  resolution: string;
  severity: 'low' | 'medium' | 'high';  // Add this missing field
  moderationResult: {
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  };
  createdAt: string;
}