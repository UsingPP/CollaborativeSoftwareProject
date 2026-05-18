import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import '../types/tpyes';
import { Team } from '../types/tpyes';

interface AuthState {
    isLoggedIn : boolean;
    userId : string | null;
    myTeamList : Team[];
    // token : string | null; 
}

const initialState : AuthState = {
    isLoggedIn : localStorage.getItem("isLoggedIn") == "true",
    userId : localStorage.getItem("userId"),
    myTeamList : JSON.parse(localStorage.getItem("myTeamList") || "[]"),
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
        setMyTeamList(state, action : PayloadAction<Team[]>) {
            state.myTeamList = action.payload;
            localStorage.setItem("myTeamList", JSON.stringify(action.payload));
        },
        logout(state) {
        state.isLoggedIn = false;
        state.userId = null;
        state.myTeamList = [];
        // state.token = null;

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userId");
        localStorage.removeItem("myTeamList");

        // localStorage.removeItem("token");
        },
  },
});

export const { login, logout, setMyTeamList } = authSlice.actions;
export default authSlice.reducer;
