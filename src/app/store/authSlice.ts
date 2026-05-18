import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isLoggedIn : boolean;
    userId : string | null;
    // token : string | null; 
}

const initialState : AuthState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") == "true",
    userId : localStorage.getItem("userId"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: { 
      login(state, action: PayloadAction<{ userId: string }>) {
      state.isLoggedIn = true;
      state.userId = action.payload.userId;
      // state.token = action.payload.token; // JWT 나중에 여기 저장

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userId", action.payload.userId);
    
      // localStorage.setItem("token", action.payload.token); 
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userId = null;
      // state.token = null;

      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userId");

      // localStorage.removeItem("token");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
