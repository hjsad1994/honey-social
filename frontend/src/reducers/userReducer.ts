import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types/types';

interface UserState {
  user: User | null;
}

const userFromLocalStorage: User | null = JSON.parse(localStorage.getItem("user-honeys") || "null");

const initialState: UserState = {
  user: userFromLocalStorage,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      // Đảm bảo localStorage được cập nhật
      if (action.payload) {
        localStorage.setItem("user-honeys", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user-honeys");
      }
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("user-honeys");
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;