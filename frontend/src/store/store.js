import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../reducers/authReducer';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other reducers here as your app grows
  },
});

export default store;