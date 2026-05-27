import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const api = axios.create({
    baseURL: serverUrl,
    headers: {
        "Content-Type": 'application/json',
    },
    withCredentials: true, // refresh_token cookie 전송을 위해 필요
});

// Request interceptor: 매 요청에 Access Token 헤더 추가
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 토큰 갱신 중복 방지 플래그
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Response interceptor: 401 수신 시 /api/auth/refresh 호출 후 재시도
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 401이고, 아직 재시도하지 않았고, refresh 요청 자체가 아닌 경우만 처리
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes("/api/auth/refresh") &&
            !originalRequest.url?.includes("/api/auth/login")
        ) {
            if (isRefreshing) {
                // 이미 갱신 중이면 큐에 추가하여 대기
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const res = await api.post("/api/auth/refresh");
                const newToken = res.data.access_token;

                localStorage.setItem("token", newToken);
                localStorage.setItem("userId", res.data.user_id);

                api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                processQueue(null, newToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);

                // Refresh 실패 → 로그아웃 처리
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userId");
                localStorage.removeItem("token");
                window.location.href = "/";
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;