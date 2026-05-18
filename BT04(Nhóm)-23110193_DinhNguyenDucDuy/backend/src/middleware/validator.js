const { body } = require("express-validator");
exports.registerValidator = [
  body("email").isEmail().withMessage("Email không hợp lệ"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu tối thiểu 6 ký tự"),
  body("username").notEmpty().withMessage("Tên không được để trống"),
];
