import {
  createUserService,
  loginService,
  getUserService,
  getAccountService,
  forgotPasswordService,
  resetPasswordService,
  updateUserService,
  deleteUserService,
  changePasswordService,
} from "../services/userService.js";

// POST /v1/api/register
const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ EC: 1, EM: "Vui lòng nhập đầy đủ thông tin (name, email, password)", DT: null });
    }
    const result = await createUserService({ name, email, password, role });
    return res.status(result.EC === 0 ? 201 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// POST /v1/api/login
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ EC: 1, EM: "Vui lòng nhập email và mật khẩu", DT: null });
    }
    const result = await loginService({ email, password });
    return res.status(result.EC === 0 ? 200 : 401).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// GET /v1/api/user
const getUser = async (req, res) => {
  try {
    const result = await getUserService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// GET /v1/api/account
const getAccount = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ EC: -1, EM: "Unauthorized", DT: null });
    const result = await getAccountService(userId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// POST /v1/api/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ EC: 1, EM: "Vui lòng nhập email", DT: null });
    const result = await forgotPasswordService(email);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// POST /v1/api/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token) return res.status(400).json({ EC: 1, EM: "Token không hợp lệ", DT: null });
    if (!password || password.length < 6) {
      return res.status(400).json({ EC: 1, EM: "Mật khẩu phải có ít nhất 6 ký tự", DT: null });
    }
    const result = await resetPasswordService(token, password);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// PUT /v1/api/user/:id
const updateUserCtrl = async (req, res) => {
  try {
    const { name, role } = req.body;
    const result = await updateUserService(req.params.id, { name, role });
    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// DELETE /v1/api/user/:id
const deleteUserCtrl = async (req, res) => {
  try {
    const result = await deleteUserService(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// PUT /v1/api/account/change-password
const changePasswordCtrl = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ EC: 1, EM: "Vui lòng nhập đầy đủ mật khẩu cũ và mới", DT: null });
    }
    const result = await changePasswordService(userId, oldPassword, newPassword);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

export {
  createUser, handleLogin, getUser, getAccount,
  forgotPassword, resetPassword,
  updateUserCtrl, deleteUserCtrl, changePasswordCtrl,
};
