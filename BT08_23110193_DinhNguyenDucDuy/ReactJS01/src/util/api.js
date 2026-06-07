import instance from "./axios.customize.js";

// ── Auth ──────────────────────────────────────────────
export const createUserApi = (name, email, password) =>
  instance.post("/v1/api/register", { name, email, password });

export const loginApi = (email, password) =>
  instance.post("/v1/api/login", { email, password });

export const fetchAccountApi = () =>
  instance.get("/v1/api/account");

// Email Verification
export const verifyEmailApi = (token) =>
  instance.get(`/v1/api/verify-email/${token}`);

export const resendVerificationApi = (email) =>
  instance.post("/v1/api/resend-verification", { email });

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

export const getTopProductsApi = (params) =>
  instance.get("/v1/api/products/top", { params });

export const getProductDetailApi = (id) =>
  instance.get(`/v1/api/products/${id}`);

export const getSimilarProductsApi = (id) =>
  instance.get(`/v1/api/products/similar/${id}`);

export const getCategoriesApi = () =>
  instance.get("/v1/api/categories");

export const getProductReviewsApi = (productId) =>
  instance.get(`/v1/api/products/${productId}/reviews`);

export const getReviewEligibilityApi = (productId) =>
  instance.get(`/v1/api/products/${productId}/review-eligibility`);

export const createReviewApi = (productId, data) =>
  instance.post(`/v1/api/products/${productId}/reviews`, data);

// Realtime notifications
export const getNotificationsApi = (params) =>
  instance.get("/v1/api/notifications", { params });

export const markNotificationReadApi = (id) =>
  instance.put(`/v1/api/notifications/${id}/read`);

export const markAllNotificationsReadApi = () =>
  instance.put("/v1/api/notifications/read-all");

export const getMyStoreApi = () =>
  instance.get("/v1/api/store/me");

export const getPromotionsApi = () =>
  instance.get("/v1/api/promotions");

export const toggleFavoriteApi = (productId) =>
  instance.post(`/v1/api/store/favorites/${productId}`);

export const recordRecentlyViewedApi = (productId) =>
  instance.post(`/v1/api/store/recently-viewed/${productId}`);

// ── Cart ──────────────────────────────────────────────────────────────
export const getCartApi = () =>
  instance.get("/v1/api/cart");

export const addCartItemApi = (productId, quantity = 1) =>
  instance.post("/v1/api/cart/items", { productId, quantity });

export const updateCartItemApi = (productId, quantity) =>
  instance.put(`/v1/api/cart/items/${productId}`, { quantity });

export const removeCartItemApi = (productId) =>
  instance.delete(`/v1/api/cart/items/${productId}`);

export const clearCartApi = () =>
  instance.delete("/v1/api/cart");

// ── Orders / Checkout ─────────────────────────────────────────────────
export const checkoutApi = (data) =>
  instance.post("/v1/api/checkout", data);

export const confirmMomoReturnApi = (data) =>
  instance.post("/v1/api/momo/return", data);

export const getOrdersApi = () =>
  instance.get("/v1/api/orders");

export const getOrderDetailApi = (id) =>
  instance.get(`/v1/api/orders/${id}`);

export const syncMomoPaymentApi = (id) =>
  instance.post(`/v1/api/orders/${id}/sync-momo`);

export const cancelOrderApi = (id, reason) =>
  instance.post(`/v1/api/orders/${id}/cancel`, { reason });

export const updateOrderStatusApi = (id, status, note = "") =>
  instance.put(`/v1/api/orders/${id}/status`, { status, note });

export const getAdminDashboardApi = () =>
  instance.get("/v1/api/admin/dashboard");

export const getAdminStatisticsApi = (params) =>
  instance.get("/v1/api/admin/statistics", { params });

export const getAdminOrdersApi = (params) =>
  instance.get("/v1/api/admin/orders", { params });

export const getAdminLoyaltyApi = () =>
  instance.get("/v1/api/admin/loyalty");

export const createVoucherApi = (data) =>
  instance.post("/v1/api/admin/vouchers", data);
