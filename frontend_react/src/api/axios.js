import axios from "axios";
import ENV_VARS from "../../config";
import loginApi from "./login"; // Import API login để gọi refreshToken

const api = axios.create({
  baseURL: ENV_VARS.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await loginApi.refreshToken(); // Gọi API refreshToken
        const newAccessToken = response.data.newAccessToken;

        // Lưu token mới vào localStorage
        localStorage.setItem("accessToken", newAccessToken);

        // Cập nhật token mới vào header Authorization
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Gửi lại request ban đầu
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
