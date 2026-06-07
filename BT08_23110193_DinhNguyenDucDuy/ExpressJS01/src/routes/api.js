import express from "express";
import checkAuth from "../middleware/auth.js";
import {
  createUser, handleLogin, getUser, getAccount,
  forgotPassword, resetPassword,
  updateUserCtrl, deleteUserCtrl, changePasswordCtrl,
  verifyEmail, resendVerification,
} from "../controllers/userController.js";
import {
  getProducts, getHomeProducts, getSimilarProducts,
  getProductDetail, getCategories, getTopProducts,
  createProduct, updateProduct, deleteProduct,
} from "../controllers/productController.js";
import {
  getCart, addCartItem, updateCartItem,
  removeCartItem, clearCart,
} from "../controllers/cartController.js";
import {
  checkout, getOrders, getOrderDetail,
  cancelOrder, updateOrderStatus,
  confirmMomoReturn, momoIpn, syncMomoPayment,
  getAdminOrders, getAdminDashboard,
} from "../controllers/orderController.js";
import {
  createVoucher, getAdminLoyalty, getMyStore, getPromotions,
  recordRecentlyViewed, toggleFavorite,
} from "../controllers/loyaltyController.js";
import {
  createReview, getProductReviews, getReviewEligibility,
} from "../controllers/reviewController.js";
import {
  getNotifications, markAllNotificationsRead, markNotificationRead,
} from "../controllers/notificationController.js";
import { getAdminStatistics } from "../controllers/statisticsController.js";

const router = express.Router();

// ── Public Auth ────────────────────────────
router.post("/register", createUser);
router.post("/login", handleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// Email Verification
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

// ── Products (public) ──────────────────────
router.get("/products/home", getHomeProducts);
router.get("/products/top", getTopProducts);
router.get("/products/similar/:id", getSimilarProducts);
router.get("/products", getProducts);
router.get("/products/:id", getProductDetail);
router.get("/categories", getCategories);
router.get("/products/:productId/reviews", getProductReviews);
router.post("/momo/ipn", momoIpn);

// ── Protected ──────────────────────────────
router.get("/user", checkAuth, getUser);
router.get("/account", checkAuth, getAccount);
router.put("/user/:id", checkAuth, updateUserCtrl);
router.delete("/user/:id", checkAuth, deleteUserCtrl);
router.put("/account/change-password", checkAuth, changePasswordCtrl);
router.get("/store/me", checkAuth, getMyStore);
router.get("/promotions", checkAuth, getPromotions);
router.post("/store/favorites/:productId", checkAuth, toggleFavorite);
router.post("/store/recently-viewed/:productId", checkAuth, recordRecentlyViewed);
router.get("/products/:productId/review-eligibility", checkAuth, getReviewEligibility);
router.post("/products/:productId/reviews", checkAuth, createReview);
router.get("/notifications", checkAuth, getNotifications);
router.put("/notifications/read-all", checkAuth, markAllNotificationsRead);
router.put("/notifications/:id/read", checkAuth, markNotificationRead);

// ── Cart ───────────────────────────────────
router.get("/cart", checkAuth, getCart);
router.post("/cart/items", checkAuth, addCartItem);
router.put("/cart/items/:productId", checkAuth, updateCartItem);
router.delete("/cart/items/:productId", checkAuth, removeCartItem);
router.delete("/cart", checkAuth, clearCart);

// ── Orders / Checkout ──────────────────────
router.post("/checkout", checkAuth, checkout);
router.post("/momo/return", checkAuth, confirmMomoReturn);
router.get("/orders", checkAuth, getOrders);
router.get("/orders/:id", checkAuth, getOrderDetail);
router.post("/orders/:id/sync-momo", checkAuth, syncMomoPayment);
router.post("/orders/:id/cancel", checkAuth, cancelOrder);
router.put("/orders/:id/status", checkAuth, updateOrderStatus);
router.get("/admin/dashboard", checkAuth, getAdminDashboard);
router.get("/admin/statistics", checkAuth, getAdminStatistics);
router.get("/admin/orders", checkAuth, getAdminOrders);
router.get("/admin/loyalty", checkAuth, getAdminLoyalty);
router.post("/admin/vouchers", checkAuth, createVoucher);

// ── Products (admin) ───────────────────────
router.post("/products", checkAuth, createProduct);
router.put("/products/:id", checkAuth, updateProduct);
router.delete("/products/:id", checkAuth, deleteProduct);

export default router;
