import instance from "./axios.customize.js";

// ── Auth ──────────────────────────────────────────────
export const createUserApi = (name, email, password) =>
  instance.post("/v1/api/register", { name, email, password });

export const loginApi = (email, password) =>
  instance.post("/v1/api/login", { email, password });

export const fetchAccountApi = () =>
  instance.get("/v1/api/account");

// ── User Management ───────────────────────────────────
export const getUserApi = () =>
  instance.get("/v1/api/user");

export const updateUserApi = (id, data) =>
  instance.put(`/v1/api/user/${id}`, data);

export const deleteUserApi = (id) =>
  instance.delete(`/v1/api/user/${id}`);

export const changePasswordApi = (data) =>
  instance.put("/v1/api/account/change-password", data);

// ── Forgot / Reset Password ───────────────────────────
export const forgotPasswordApi = (email) =>
  instance.post("/v1/api/forgot-password", { email });

export const resetPasswordApi = (token, password) =>
  instance.post(`/v1/api/reset-password/${token}`, { password });

// ── Products ──────────────────────────────────────────
export const getProductsApi = (params) =>
  instance.get("/v1/api/products", { params });

export const getHomeProductsApi = () =>
  instance.get("/v1/api/products/home");

export const getProductDetailApi = (id) =>
  instance.get(`/v1/api/products/${id}`);

export const getSimilarProductsApi = (id) =>
  instance.get(`/v1/api/products/similar/${id}`);

export const getCategoriesApi = () =>
  instance.get("/v1/api/categories");
