import {
  createUserService,
  loginService,
  getUserService,
  getAccountService,
  forgotPasswordService,
} from "../services/userService.js";

// =====================
// POST /v1/api/register
// =====================
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation cơ bản
    if (!name || !email || !password) {
      return res.status(400).json({
        EC: 1,
        EM: "Vui lòng nhập đầy đủ thông tin (name, email, password)",
        DT: null,
      });
    }

    const result = await createUserService({ name, email, password, role });
    const statusCode = result.EC === 0 ? 201 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("createUser controller error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

// =====================
// POST /v1/api/login
// =====================
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation cơ bản
    if (!email || !password) {
      return res.status(400).json({
        EC: 1,
        EM: "Vui lòng nhập email và mật khẩu",
        DT: null,
      });
    }

    const result = await loginService({ email, password });
    const statusCode = result.EC === 0 ? 200 : 401;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("handleLogin controller error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

// =====================
// GET /v1/api/user
// =====================
const getUser = async (req, res) => {
  try {
    const result = await getUserService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("getUser controller error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

// =====================
// GET /v1/api/account
// =====================
const getAccount = async (req, res) => {
  try {
    // req.user được gán bởi auth middleware
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        EC: -1,
        EM: "Unauthorized",
        DT: null,
      });
    }

    const result = await getAccountService(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("getAccount controller error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

// =====================
// POST /v1/api/forgot-password
// =====================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        EC: 1,
        EM: "Vui lòng nhập email",
        DT: null,
      });
    }

    const result = await forgotPasswordService(email);
    const statusCode = result.EC === 0 ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    console.error("forgotPassword controller error:", error);
    return res.status(500).json({
      EC: -1,
      EM: "Lỗi server",
      DT: null,
    });
  }
};

export { createUser, handleLogin, getUser, getAccount, forgotPassword };
