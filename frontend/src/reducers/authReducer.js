import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    authScreen: 'login',
  },
  reducers: {
    setAuthScreen: (state, action) => {
      state.authScreen = action.payload;
    },
  },
});

export const { setAuthScreen } = authSlice.actions;
export default authSlice.reducer;