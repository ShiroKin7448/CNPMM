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
  getProductDetail, getCategories,
  createProduct, updateProduct, deleteProduct,
} from "../controllers/productController.js";

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
router.get("/products/similar/:id", getSimilarProducts);
router.get("/products", getProducts);
router.get("/products/:id", getProductDetail);
router.get("/categories", getCategories);

// ── Protected ──────────────────────────────
router.get("/user", checkAuth, getUser);
router.get("/account", checkAuth, getAccount);
router.put("/user/:id", checkAuth, updateUserCtrl);
router.delete("/user/:id", checkAuth, deleteUserCtrl);
router.put("/account/change-password", checkAuth, changePasswordCtrl);

// ── Products (admin) ───────────────────────
router.post("/products", checkAuth, createProduct);
router.put("/products/:id", checkAuth, updateProduct);
router.delete("/products/:id", checkAuth, deleteProduct);

export default router;
