import axios from "axios";

// Tạo axios instance với base URL từ biến môi trường
const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: false,
  timeout: 10000,
});

// =====================
// Request Interceptor
// Đính kèm Bearer token vào mọi request
// =====================
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================
// Response Interceptor
// Bóc tách response.data để các hàm api.js nhận được trực tiếp
// =====================
instance.interceptors.response.use(
  (response) => {
    // Trả về response.data thay vì toàn bộ response object
    return response.data;
  },
  (error) => {
    // Xử lý lỗi HTTP (4xx, 5xx)
    const errorData = {
      EC: -1,
      EM: "Lỗi kết nối đến server",
      DT: null,
    };

    if (error.response) {
      // Server trả về response với status code lỗi
      return Promise.reject(error.response.data || errorData);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      errorData.EM = "Không thể kết nối đến server. Vui lòng kiểm tra lại.";
      return Promise.reject(errorData);
    }

    return Promise.reject(errorData);
  }
);

export default instance;
