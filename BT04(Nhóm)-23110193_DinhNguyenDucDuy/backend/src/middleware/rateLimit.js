const rateLimit = require("express-rate-limit");
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Quá nhiều lần thử, vui lòng quay lại sau 15 phút",
});
