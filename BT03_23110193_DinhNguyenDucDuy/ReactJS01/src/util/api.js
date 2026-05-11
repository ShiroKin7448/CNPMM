import instance from "./axios.customize.js";

// =====================
// Auth APIs
// =====================

/**
 * Đăng ký tài khoản mới
 * @param {string} name - Tên người dùng
 * @param {string} email - Email
 * @param {string} password - Mật khẩu
 * @returns {Promise} { EC, EM, DT }
 */
const createUserApi = (name, email, password) => {
  return instance.post("/v1/api/register", { name, email, password });
};

/**
 * Đăng nhập
 * @param {string} email
 * @param {string} password
 * @returns {Promise} { EC, EM, DT: { access_token, user } }
 */
const loginApi = (email, password) => {
  return instance.post("/v1/api/login", { email, password });
};

/**
 * Lấy thông tin tài khoản hiện tại (cần Bearer token)
 * @returns {Promise} { EC, EM, DT: user }
 */
const fetchAccountApi = () => {
  return instance.get("/v1/api/account");
};

// =====================
// User Management APIs
// =====================

/**
 * Lấy danh sách tất cả user (cần Bearer token)
 * @returns {Promise} { EC, EM, DT: [users] }
 */
const getUserApi = () => {
  return instance.get("/v1/api/user");
};

// =====================
// Forgot Password API
// =====================

/**
 * Yêu cầu reset mật khẩu qua email
 * @param {string} email - Email cần reset
 * @returns {Promise} { EC, EM, DT }
 */
const forgotPasswordApi = (email) => {
  return instance.post("/v1/api/forgot-password", { email });
};

export { createUserApi, loginApi, fetchAccountApi, getUserApi, forgotPasswordApi };
