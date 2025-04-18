// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { Post } from '../types/types';

// interface UserPostsMap {
//   [userId: string]: Post[];
// }

// interface PostState {
//   posts: Post[];
//   userPosts: UserPostsMap;
//   currentPost: Post | null;
// }

// interface SetUserPostsPayload {
//   userId: string;
//   posts: Post[];
// }

// interface RemoveReplyPayload {
//   postId: string;
//   replyId: string;
// }

// const initialState: PostState = {
//   posts: [],
//   userPosts: {},
//   currentPost: null,
// };

// const postSlice = createSlice({
//   name: 'posts',
//   initialState,
//   reducers: {
//     setPosts: (state, action: PayloadAction<Post[]>) => {
//       state.posts = action.payload;
//     },
//     addPost: (state, action: PayloadAction<Post>) => {
//       const newPost = action.payload;
//       state.posts = [newPost, ...state.posts];
//       const userId = newPost.postedBy;
//       if (userId) {
//         if (!state.userPosts[userId]) {
//           state.userPosts[userId] = [];
//         }
//         state.userPosts[userId] = [newPost, ...state.userPosts[userId]];
//       }
//     },
//     setUserPosts: (state, action: PayloadAction<SetUserPostsPayload>) => {
//       const { userId, posts } = action.payload;
//       state.userPosts[userId] = posts;
//     },
//     deletePost: (state, action: PayloadAction<string>) => {
//       const postIdToDelete = action.payload;
//       state.posts = state.posts.filter(post => post._id !== postIdToDelete);
      
//       // Remove from userPosts as well
//       Object.keys(state.userPosts).forEach(userId => {
//         if (state.userPosts[userId]) {
//           state.userPosts[userId] = state.userPosts[userId].filter(
//             post => post._id !== postIdToDelete
//           );
//         }
//       });
//     },
//     updatePost: (state, action: PayloadAction<Post>) => {
//       state.posts = state.posts.map(post =>
//         post._id === action.payload._id ? action.payload : post
//       );
      
//       state.currentPost = state.currentPost?._id === action.payload._id ?
//         action.payload : state.currentPost;
      
//       for (const userId in state.userPosts) {
//         const userPostIndex = state.userPosts[userId].findIndex(
//           post => post._id === action.payload._id
//         );
//         if (userPostIndex !== -1) {
//           state.userPosts[userId][userPostIndex] = action.payload;
//         }
//       }
//     },
//     removeReply: (state, action: PayloadAction<RemoveReplyPayload>) => {
//       const { postId, replyId } = action.payload;
      
//       console.log("removeReply được kích hoạt trong reducer:", postId, replyId);
      
//       try {
//         // Tạo một mảng posts mới hoàn toàn
//         const updatedPosts = state.posts.map(post => {
//           if (post._id === postId) {
//             console.log("Tìm thấy post cần cập nhật:", post._id);
//             console.log("Số replies trước khi xóa:", post.replies?.length || 0);
            
//             // Luôn trả về object mới để đảm bảo reference thay đổi
//             return {
//               ...post,
//               replies: post.replies 
//                 ? [...post.replies.filter(reply => reply._id !== replyId)]
//                 : []
//             };
//           }
//           return post;
//         });
        
//         // Thay thế toàn bộ state.posts
//         state.posts = [...updatedPosts];
        
//         // Cũng cập nhật currentPost nếu có
//         if (state.currentPost && state.currentPost._id === postId) {
//           state.currentPost = {
//             ...state.currentPost,
//             replies: state.currentPost.replies
//               ? [...state.currentPost.replies.filter(reply => reply._id !== replyId)]
//               : []
//           };
//         }
        
//         // Cập nhật userPosts với references mới
//         Object.keys(state.userPosts).forEach(userId => {
//           state.userPosts[userId] = state.userPosts[userId].map(post => {
//             if (post._id === postId) {
//               return {
//                 ...post,
//                 replies: post.replies
//                   ? [...post.replies.filter(reply => reply._id !== replyId)]
//                   : []
//               };
//             }
//             return post;
//           });
//         });
        
//         console.log("Reducer đã cập nhật state");
//       } catch (error) {
//         console.error("Lỗi trong reducer removeReply:", error);
//       }
//     },
//   },
// });

// export const { 
//   setPosts, 
//   addPost, 
//   setUserPosts, 
//   deletePost, 
//   updatePost, 
//   removeReply 
// } = postSlice.actions;

// export default postSlice.reducer;
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Post, User } from "../types/types";

type UserPostsMap = Record<string, Post[]>;

interface PostState {
  posts: Post[];
  userPosts: UserPostsMap;
  currentPost: Post | null;
}

interface SetUserPostsPayload {
  userId: string;
  posts: Post[];
}

interface RemoveReplyPayload {
  postId: string;
  replyId: string;
}

const initialState: PostState = {
  posts: [],
  userPosts: {},
  currentPost: null,
};

/** Trả về userId string hoặc undefined */
const getUserId = (postedBy: string | User): string | undefined =>
  typeof postedBy === "string" ? postedBy : postedBy?._id;

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, { payload }: PayloadAction<Post[]>) => {
      state.posts = payload;
    },

    addPost: (state, { payload: newPost }: PayloadAction<Post>) => {
      state.posts = [newPost, ...state.posts];

      const userId = getUserId(newPost.postedBy);
      if (!userId) return;

      state.userPosts[userId] = state.userPosts[userId]
        ? [newPost, ...state.userPosts[userId]]
        : [newPost];
    },

    setUserPosts: (state, { payload }: PayloadAction<SetUserPostsPayload>) => {
      state.userPosts[payload.userId] = payload.posts;
    },

    deletePost: (state, { payload: postId }: PayloadAction<string>) => {
      state.posts = state.posts.filter((p) => p._id !== postId);

      Object.keys(state.userPosts).forEach((uid) => {
        state.userPosts[uid] = state.userPosts[uid].filter(
          (p) => p._id !== postId,
        );
      });
    },

    updatePost: (state, { payload }: PayloadAction<Post>) => {
      state.posts = state.posts.map((p) =>
        p._id === payload._id ? payload : p,
      );

      if (state.currentPost?._id === payload._id) state.currentPost = payload;

      Object.keys(state.userPosts).forEach((uid) => {
        const idx = state.userPosts[uid].findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.userPosts[uid][idx] = payload;
      });
    },

    removeReply: (state, { payload }: PayloadAction<RemoveReplyPayload>) => {
      const { postId, replyId } = payload;

      /** helper xoá reply trong 1 Post */
      const stripReply = (post: Post): Post =>
        post._id === postId
          ? {
              ...post,
              replies: post.replies?.filter((r) => r._id !== replyId) ?? [],
            }
          : post;

      state.posts = state.posts.map(stripReply);
      if (state.currentPost) state.currentPost = stripReply(state.currentPost);

      Object.keys(state.userPosts).forEach((uid) => {
        state.userPosts[uid] = state.userPosts[uid].map(stripReply);
      });
    },
  },
});

export const {
  setPosts,
  addPost,
  setUserPosts,
  deletePost,
  updatePost,
  removeReply,
} = postSlice.actions;

export default postSlice.reducer;
