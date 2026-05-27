import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import '../types/tpyes';
import { Team } from '../types/tpyes';
import api from './api';

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
        state.userId = action.payload.user_id;
        state.token = action.payload.token;

        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userId", action.payload.user_id);
        localStorage.setItem("token", action.payload.token); 
        },
        logout(state) {
        // 서버에 로그아웃 요청 (refresh_token cookie 삭제 + DB 토큰 삭제)
        api.post("/api/auth/logout").catch(() => {
            // 로그아웃 API 실패해도 로컬 상태는 정리
        });

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
