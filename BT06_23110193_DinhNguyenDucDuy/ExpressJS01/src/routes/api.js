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
router.post("/momo/ipn", momoIpn);

// ── Protected ──────────────────────────────
router.get("/user", checkAuth, getUser);
router.get("/account", checkAuth, getAccount);
router.put("/user/:id", checkAuth, updateUserCtrl);
router.delete("/user/:id", checkAuth, deleteUserCtrl);
router.put("/account/change-password", checkAuth, changePasswordCtrl);

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
router.get("/admin/orders", checkAuth, getAdminOrders);

// ── Products (admin) ───────────────────────
router.post("/products", checkAuth, createProduct);
router.put("/products/:id", checkAuth, updateProduct);
router.delete("/products/:id", checkAuth, deleteProduct);

export default router;
