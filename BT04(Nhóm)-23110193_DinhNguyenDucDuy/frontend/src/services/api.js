import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor to add token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[api] request failed", {
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status,
      responseData: error?.response?.data,
      message: error?.message,
    });
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const adminAPI = {
  list: (resource, q = "") => api.get(`/admin/${resource}`, { params: { q } }),
  create: (resource, data) => api.post(`/admin/${resource}`, data),
  update: (resource, id, data) => api.put(`/admin/${resource}/${id}`, data),
  remove: (resource, id) => api.delete(`/admin/${resource}/${id}`),
};

export const faqAPI = {
  list: (params = {}) => api.get("/faqs", { params }),
};

export const searchAPI = {
  search: (params = {}) => api.get("/search", { params }),
};

export const forumAPI = {
  listThreads: (q = "") => api.get("/forum/threads", { params: { q } }),
  getThread: (id) => api.get(`/forum/threads/${id}`),
  createThread: (data) => api.post("/forum/threads", data),
  createReply: (threadId, data) =>
    api.post(`/forum/threads/${threadId}/replies`, data),
  upvoteThread: (threadId) => api.patch(`/forum/threads/${threadId}/upvote`),
  toggleSolved: (threadId) => api.patch(`/forum/threads/${threadId}/solved`),
  togglePin: (threadId) => api.patch(`/forum/threads/${threadId}/pin`),
  deleteThread: (threadId) => api.delete(`/forum/threads/${threadId}`),
  deleteReply: (threadId, replyId) =>
    api.delete(`/forum/threads/${threadId}/replies/${replyId}`),
};

export default api;
