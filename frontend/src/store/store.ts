import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';
import userReducer from '../reducers/userReducer';
import postReducer from '../reducers/postReducer';

export interface RootState {
  auth: ReturnType<typeof authReducer>;
  user: ReturnType<typeof userReducer>;
  posts: ReturnType<typeof postReducer>;
}

// Middleware with proper typing
const loggerMiddleware: Middleware = store => next => action => {
  const prevState = store.getState() as RootState;
  console.log('dispatching action:', action);
  
  let result = next(action);
  
  const nextState = store.getState() as RootState;
  console.log('prev state:', prevState);
  console.log('next state:', nextState);
  
  // So sánh state cũ và mới cho post reducer
  if (action.type.startsWith('posts/')) {
    console.log('posts changed:', 
      prevState.posts !== nextState.posts,
      'posts array changed:',
      prevState.posts.posts !== nextState.posts.posts
    );
  }
  
  return result;
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    posts: postReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(loggerMiddleware)
});

export type AppDispatch = typeof store.dispatch;
export default store;