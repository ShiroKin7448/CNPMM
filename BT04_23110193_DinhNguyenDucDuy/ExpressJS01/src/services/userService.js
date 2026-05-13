import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import User from "../models/user.js";
dotenv.config();

const SALT_ROUNDS = 10;

// =====================
// Helper: Tạo JWT Token
// =====================
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1d",
  });
};

// =====================
// Helper: Nodemailer transporter
// =====================
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// =====================
// Service: Tạo User mới (Register)
// =====================
const createUserService = async ({ name, email, password, role }) => {
  try {
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        EC: 1,
        EM: "Email đã được sử dụng",
        DT: null,
      };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Tạo user mới
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    return {
      EC: 0,
      EM: "Đăng ký thành công!",
      DT: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error("createUserService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi tạo user",
      DT: null,
    };
  }
};

// =====================
// Service: Đăng nhập (Login)
// =====================
const loginService = async ({ email, password }) => {
  try {
    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return {
        EC: 1,
        EM: "Email hoặc mật khẩu không đúng",
        DT: null,
      };
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return {
        EC: 1,
        EM: "Email hoặc mật khẩu không đúng",
        DT: null,
      };
    }

    // Tạo JWT token
    const token = generateToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    return {
      EC: 0,
      EM: "Đăng nhập thành công!",
      DT: {
        access_token: token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    };
  } catch (error) {
    console.error("loginService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi đăng nhập",
      DT: null,
    };
  }
};

// =====================
// Service: Lấy danh sách User
// =====================
const getUserService = async () => {
  try {
    const users = await User.find({}).select("-password -resetPasswordToken -resetPasswordExpires");
    return {
      EC: 0,
      EM: "Lấy danh sách user thành công",
      DT: users,
    };
  } catch (error) {
    console.error("getUserService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi lấy danh sách user",
      DT: null,
    };
  }
};

// =====================
// Service: Lấy thông tin tài khoản (Account)
// =====================
const getAccountService = async (userId) => {
  try {
    const user = await User.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires");
    if (!user) {
      return {
        EC: 1,
        EM: "Không tìm thấy tài khoản",
        DT: null,
      };
    }
    return {
      EC: 0,
      EM: "Lấy thông tin tài khoản thành công",
      DT: user,
    };
  } catch (error) {
    console.error("getAccountService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi lấy thông tin tài khoản",
      DT: null,
    };
  }
};

// =====================
// Service: Forgot Password
// =====================
const forgotPasswordService = async (email) => {
  try {
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return {
        EC: 1,
        EM: "Email không tồn tại trong hệ thống",
        DT: null,
      };
    }

    // Tạo reset token ngẫu nhiên (32 bytes hex)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token trước khi lưu vào DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Lưu hashed token và expiry vào DB (token hết hạn sau 15 phút)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
    await user.save();

    // Tạo URL reset password
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Gửi email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Yêu cầu đặt lại mật khẩu - BT04 System",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            🔐 Đặt lại mật khẩu
          </h2>
          <p>Xin chào <strong>${user.name}</strong>,</p>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Nhấp vào nút bên dưới để đặt lại mật khẩu. Link này sẽ hết hạn sau <strong>15 phút</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Đặt lại mật khẩu
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
          </p>
          <p style="color: #666; font-size: 14px;">
            Hoặc copy link: <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            © 2024 BT04 - 23110193 - Đinh Nguyễn Đức Duy
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      EC: 0,
      EM: `Email đặt lại mật khẩu đã được gửi đến ${email}. Vui lòng kiểm tra hộp thư.`,
      DT: { email },
    };
  } catch (error) {
    console.error("forgotPasswordService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi gửi email đặt lại mật khẩu",
      DT: null,
    };
  }
};

// =====================
// Service: Reset Password (xác nhận token từ email)
// =====================
const resetPasswordService = async (token, newPassword) => {
  try {
    // Hash lại token nhận từ URL để so sánh với DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Tìm user có token hợp lệ và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // Token còn hạn
    });

    if (!user) {
      return {
        EC: 1,
        EM: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn (15 phút)",
        DT: null,
      };
    }

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Cập nhật mật khẩu và xóa token
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return {
      EC: 0,
      EM: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập.",
      DT: { email: user.email },
    };
  } catch (error) {
    console.error("resetPasswordService error:", error);
    return {
      EC: -1,
      EM: "Lỗi server khi đặt lại mật khẩu",
      DT: null,
    };
  }
};

// =====================
// Service: Cập nhật thông tin User
// =====================
const updateUserService = async (userId, { name, role }) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { name, role },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpires");

    if (!user) return { EC: 1, EM: "Không tìm thấy user", DT: null };
    return { EC: 0, EM: "Cập nhật user thành công", DT: user };
  } catch (error) {
    console.error("updateUserService error:", error);
    return { EC: -1, EM: "Lỗi server khi cập nhật user", DT: null };
  }
};

// =====================
// Service: Xóa User
// =====================
const deleteUserService = async (userId) => {
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return { EC: 1, EM: "Không tìm thấy user", DT: null };
    return { EC: 0, EM: "Xóa user thành công", DT: null };
  } catch (error) {
    console.error("deleteUserService error:", error);
    return { EC: -1, EM: "Lỗi server khi xóa user", DT: null };
  }
};

// =====================
// Service: Đổi mật khẩu
// =====================
const changePasswordService = async (userId, oldPassword, newPassword) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { EC: 1, EM: "Không tìm thấy tài khoản", DT: null };

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return { EC: 1, EM: "Mật khẩu cũ không đúng", DT: null };
    }

    if (newPassword.length < 6) {
      return { EC: 1, EM: "Mật khẩu mới phải có ít nhất 6 ký tự", DT: null };
    }

    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.save();

    return { EC: 0, EM: "Đổi mật khẩu thành công!", DT: null };
  } catch (error) {
    console.error("changePasswordService error:", error);
    return { EC: -1, EM: "Lỗi server khi đổi mật khẩu", DT: null };
  }
};

export {
  createUserService,
  loginService,
  getUserService,
  getAccountService,
  forgotPasswordService,
  resetPasswordService,
  updateUserService,
  deleteUserService,
  changePasswordService,
};
