import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import userReducer from '../reducers/userReducer';
import postReducer from '../reducers/postReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    posts: postReducer
  },
});

export default store;