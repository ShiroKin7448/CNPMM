import express from "express";
import checkAuth from "../middleware/auth.js";
import {
  createUser,
  handleLogin,
  getUser,
  getAccount,
  forgotPassword,
} from "../controllers/userController.js";

const router = express.Router();

// =====================
// Public Routes (không cần auth)
// =====================

// POST /v1/api/register - Đăng ký tài khoản
router.post("/register", createUser);

// POST /v1/api/login - Đăng nhập
router.post("/login", handleLogin);

// POST /v1/api/forgot-password - Quên mật khẩu
router.post("/forgot-password", forgotPassword);

// =====================
// Protected Routes (cần auth - Bearer Token)
// =====================

// GET /v1/api/user - Lấy danh sách tất cả user
router.get("/user", checkAuth, getUser);

// GET /v1/api/account - Lấy thông tin tài khoản hiện tại
router.get("/account", checkAuth, getAccount);

export default router;
