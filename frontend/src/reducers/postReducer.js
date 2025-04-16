import { createSlice } from '@reduxjs/toolkit';

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    userPosts: {},
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    addPost: (state, action) => {
      const newPost = action.payload;
      
      // Add to feed posts - always at the beginning for immediate visibility
      state.posts = [newPost, ...state.posts];
      
      // Add to user posts if the user exists
      const userId = newPost.postedBy;
      if (userId) {
        // Create the user's posts array if it doesn't exist
        if (!state.userPosts[userId]) {
          state.userPosts[userId] = [];
        }
        // Add the post to the beginning of the user's posts
        state.userPosts[userId] = [newPost, ...state.userPosts[userId]];
      }
    },
    setUserPosts: (state, action) => {
      const { userId, posts } = action.payload;
      state.userPosts[userId] = posts;
    },
    // Add this new reducer for post deletion
    deletePost: (state, action) => {
      const postIdToDelete = action.payload;
      
      // Remove from global posts array
      state.posts = state.posts.filter(post => post._id !== postIdToDelete);
      
      // Remove from userPosts for all users
      Object.keys(state.userPosts).forEach(userId => {
        if (state.userPosts[userId]) {
          state.userPosts[userId] = state.userPosts[userId].filter(
            post => post._id !== postIdToDelete
          );
        }
      });
    },
  },
});

export const { setPosts, addPost, setUserPosts, deletePost } = postSlice.actions;
export default postSlice.reducer;