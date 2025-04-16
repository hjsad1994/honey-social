import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    userPosts: {},
    currentPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      const newPost = action.payload;
      state.posts = [newPost, ...state.posts];
      const userId = newPost.postedBy;
      if (userId) {
        if (!state.userPosts[userId]) {
          state.userPosts[userId] = [];
        }
        state.userPosts[userId] = [newPost, ...state.userPosts[userId]];
      }
    },
    setUserPosts: (state, action) => {
      const { userId, posts } = action.payload;
      state.userPosts[userId] = posts;
    },
    deletePost: (state, action) => {
      const postIdToDelete = action.payload;
      state.posts = state.posts.filter(post => post._id !== postIdToDelete);
      Object.keys(state.userPosts).forEach(userId => {
        if (state.userPosts[userId]) {
          state.userPosts[userId] = state.userPosts[userId].filter(
            post => post._id !== postIdToDelete
          );
        }
      });
    },
    updatePost: (state, action) => {
      state.posts = state.posts.map(post =>
        post._id === action.payload._id ? action.payload : post
      );
      state.currentPost = state.currentPost?._id === action.payload._id ?
        action.payload : state.currentPost;
      for (const userId in state.userPosts) {
        const userPostIndex = state.userPosts[userId].findIndex(
          post => post._id === action.payload._id
        );
        if (userPostIndex !== -1) {
          state.userPosts[userId][userPostIndex] = action.payload;
        }
      }
    },
    removeReply: (state, action) => {
      const { postId, replyId } = action.payload;
      console.log("removeReply được kích hoạt trong reducer:", postId, replyId);
      
      try {
          // Tạo một mảng posts mới hoàn toàn
          const updatedPosts = state.posts.map(post => {
              if (post._id === postId) {
                  console.log("Tìm thấy post cần cập nhật:", post._id);
                  console.log("Số replies trước khi xóa:", post.replies?.length || 0);
                  
                  // Luôn trả về object mới để đảm bảo reference thay đổi
                  return {
                      ...post,
                      replies: post.replies 
                          ? [...post.replies.filter(reply => reply._id !== replyId)]
                          : []
                  };
              }
              return post;
          });
          
          // Thay thế toàn bộ state.posts
          state.posts = [...updatedPosts];
          
          // Cũng cập nhật currentPost nếu có
          if (state.currentPost && state.currentPost._id === postId) {
              state.currentPost = {
                  ...state.currentPost,
                  replies: state.currentPost.replies
                      ? [...state.currentPost.replies.filter(reply => reply._id !== replyId)]
                      : []
              };
          }
          
          // Cập nhật userPosts với references mới
          Object.keys(state.userPosts).forEach(userId => {
              state.userPosts[userId] = state.userPosts[userId].map(post => {
                  if (post._id === postId) {
                      return {
                          ...post,
                          replies: post.replies
                              ? [...post.replies.filter(reply => reply._id !== replyId)]
                              : []
                      };
                  }
                  return post;
              });
          });
          
          console.log("Reducer đã cập nhật state");
      } catch (error) {
          console.error("Lỗi trong reducer removeReply:", error);
      }
    },
  },
});

export const { setPosts, addPost, setUserPosts, deletePost, updatePost, removeReply } = postSlice.actions;
export default postSlice.reducer;
