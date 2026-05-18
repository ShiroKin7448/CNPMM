const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    if (!user.isActivated)
      return res.status(403).json({ message: "Tài khoản chưa kích hoạt OTP" });

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Đăng nhập thành công!",
      role: user.role,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("[auth:login] server error", {
      message: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({
      message: "Dữ liệu không hợp lệ",
      errors: errors.array(),
    });

  try {
    const { username, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    user = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    });

    await user.save();
    await transporter.sendMail({
      to: email,
      subject: "Mã xác thực tài khoản Website Tư vấn SV",
      text: `Mã OTP của bạn là: ${otp}. Hiệu lực trong 5 phút.`,
    });

    res
      .status(201)
      .json({ message: "Đã gửi mã OTP qua email, vui lòng kiểm tra!" });
  } catch (err) {
    console.error("[auth:register] server error", {
      message: err.message,
      stack: err.stack,
      email: req.body?.email,
      username: req.body?.username,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = generateOTP();
    const user = await User.findOneAndUpdate(
      { email },
      { otp, otpExpires: Date.now() + 5 * 60 * 1000 },
    );
    if (!user) return res.status(404).json({ message: "Không tìm thấy email" });

    await transporter.sendMail({
      to: email,
      subject: "Cấp lại mật khẩu Website Tư vấn SV",
      text: `Mã OTP để đổi mật khẩu là: ${otp}`,
    });
    res.json({ message: "Đã gửi OTP đổi mật khẩu!" });
  } catch (err) {
    console.error("[auth:forgotPassword] server error", {
      message: err.message,
      stack: err.stack,
      email: req.body?.email,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Mã OTP không đúng hoặc đã hết hạn" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    console.error("[auth:resetPassword] server error", {
      message: err.message,
      stack: err.stack,
      email: req.body?.email,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Mã OTP không đúng hoặc đã hết hạn" });
    }

    user.isActivated = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" },
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.json({
      message: "Xác thực OTP thành công!",
      role: user.role,
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error("[auth:verifyOTP] server error", {
      message: err.message,
      stack: err.stack,
      email: req.body?.email,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }

    const user = await User.findById(userId).select(
      "-password -otp -otpExpires",
    );
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (err) {
    console.error("[auth:getProfile] server error", {
      message: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }

    const { username, fullName, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        username,
        fullName,
        phone,
        address,
        updatedAt: Date.now(),
      },
      { new: true },
    ).select("-password -otp -otpExpires");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (err) {
    console.error("[auth:updateProfile] server error", {
      message: err.message,
      stack: err.stack,
      userId: req.user?.id,
    });
    res.status(500).json({
      message: "Lỗi server",
      details: err.message,
    });
  }
};
