import { createSlice } from '@reduxjs/toolkit';

// Lấy dữ liệu người dùng từ localStorage như cách Recoil đã làm
const userFromLocalStorage = JSON.parse(localStorage.getItem("user-honeys"));

const userSlice = createSlice({
  name: 'user',
  initialState: {
    // Sử dụng dữ liệu từ localStorage hoặc null nếu không có
    user: userFromLocalStorage || null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      // Lưu người dùng vào localStorage khi setUser được gọi
          localStorage.setItem("user-honeys", JSON.stringify(action.payload));
    },
    logoutUser: (state) => {
      state.user = null;
      // Xóa dữ liệu người dùng khỏi localStorage khi đăng xuất
      localStorage.removeItem("user-honeys");
    },
  },
});

export const { setUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;