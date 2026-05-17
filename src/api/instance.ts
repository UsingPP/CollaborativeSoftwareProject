import axios from "axios";

const api = axios.create({timeout:5000});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = 'Bearer ${token}';
        return config;
    }
});

api.interceptors.response.use(
    (response) => response,

    async(err) => {
        const originalRequest = err.config;

        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const res = await axios.post();
            }
        }
    }
)
