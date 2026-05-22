import axios from "axios";
import { BASE_API_URL, PORT } from "../types/tpyes";

const api = axios.create({ 
    baseURL : `${BASE_API_URL}:${PORT}`,
    headers : {
        "Content-Type" : 'application/json',
    },
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;