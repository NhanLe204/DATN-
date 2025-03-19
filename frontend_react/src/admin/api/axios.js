import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken"); 
    // console.log("Token trước khi gửi request:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Headers đã thêm token:", config.headers);
    } else {
      // console.log("Không tìm thấy token trong localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Lỗi trong interceptor request:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log("Không có quyền (401), có thể chuyển hướng về login...");
    }
    return Promise.reject(error);
  }
);

export default api;