import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import '../types/tpyes';
import { Team } from '../types/tpyes';

interface AuthState {
    isLoggedIn : boolean;
    userId : string | null;
    token : string | null; 
}

const initialState : AuthState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") == "true",
    userId : localStorage.getItem("userId"),
    token : localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: { 
        login(state, action: PayloadAction<{ user_id : string, token : string }>) {
        state.isLoggedIn = true;
        state.token = action.payload.token; // JWT 나중에 여기 저장

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", action.payload.user_id);
        localStorage.setItem("token", action.payload.token); 
        },
        logout(state) {
        state.isLoggedIn = false;
        state.userId = null;
        state.token = null;

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        localStorage.removeItem("token");
        },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
