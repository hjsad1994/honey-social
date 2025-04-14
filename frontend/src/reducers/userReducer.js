import { createSlice } from '@reduxjs/toolkit';

const userFromLocalStorage = JSON.parse(localStorage.getItem("user-honeys"));

const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: userFromLocalStorage || null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      // Đảm bảo localStorage được cập nhật
      localStorage.setItem("user-honeys", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      localStorage.removeItem("user-honeys");
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;