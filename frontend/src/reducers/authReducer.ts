import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the state interface
interface AuthState {
  authScreen: 'login' | 'register' | 'forgot';
}

const initialState: AuthState = {
  authScreen: 'login',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthScreen: (state, action: PayloadAction<AuthState['authScreen']>) => {
      state.authScreen = action.payload;
    },
  },
});

export const { setAuthScreen } = authSlice.actions;
export default authSlice.reducer;