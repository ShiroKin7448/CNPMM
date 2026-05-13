import {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import {
  getProducts,
  getHomeProducts,
  getSimilarProducts,
  getProductDetail,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import {
  updateUserCtrl,
  deleteUserCtrl,
  changePasswordCtrl,
} from "../controllers/userController.js";
import express from "express";
import checkAuth from "../middleware/auth.js";

const router = express.Router();

// ===========================
// Public Routes (không cần auth)
// ===========================
router.post("/register", createUser);
router.post("/login", handleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Products — public
router.get("/products/home", getHomeProducts);
router.get("/products/similar/:id", getSimilarProducts);
router.get("/products", getProducts);
router.get("/products/:id", getProductDetail);
router.get("/categories", getCategories);

// ===========================
// Protected Routes (cần auth)
// ===========================
router.get("/user", checkAuth, getUser);
router.get("/account", checkAuth, getAccount);

// User management (cần auth)
router.put("/user/:id", checkAuth, updateUserCtrl);
router.delete("/user/:id", checkAuth, deleteUserCtrl);
router.put("/account/change-password", checkAuth, changePasswordCtrl);

// Products — admin (cần auth)
router.post("/products", checkAuth, createProduct);
router.put("/products/:id", checkAuth, updateProduct);
router.delete("/products/:id", checkAuth, deleteProduct);

export default router;
