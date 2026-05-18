import React, { useState } from "react";
import { Input, Button, Alert } from "./UI";

export const LoginForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Nhập email của bạn"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        type="password"
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="w-4 h-4 text-primary" />
          <span className="ml-2 text-gray-700">Nhớ tôi</span>
        </label>
        <a
          href="/forgot-password"
          className="text-primary hover:text-primary-dark"
        >
          Quên mật khẩu?
        </a>
      </div>

      <Button type="submit" loading={loading}>
        Đăng nhập
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </form>
  );
};

export const RegisterForm = ({ onSubmit, loading, error, onOTPRequired }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Tên người dùng không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (!formData.email) {
      newErrors.email = "Email không được để trống";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        type="text"
        name="username"
        label="Tên người dùng"
        placeholder="Nhập tên người dùng"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="Nhập email của bạn"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        type="password"
        name="password"
        label="Mật khẩu"
        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <Button type="submit" loading={loading}>
        Đăng ký
      </Button>

      <div className="text-center">
        <p className="text-gray-600">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-primary hover:text-primary-dark font-semibold"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </form>
  );
};

export const OTPVerificationForm = ({ email, onSubmit, loading, error }) => {
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");

  const handleChange = (e) => {
    const { value } = e.target;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
      setOtpError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) {
      setOtpError("Mã OTP không được để trống");
      return;
    }
    if (otp.length !== 6) {
      setOtpError("Mã OTP phải có 6 chữ số");
      return;
    }
    onSubmit(otp);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
        <p>
          Mã OTP đã được gửi đến email: <strong>{email}</strong>
        </p>
        <p>Mã OTP sẽ hết hạn sau 5 phút.</p>
      </div>

      <Input
        type="text"
        label="Mã OTP"
        placeholder="Nhập mã OTP (6 chữ số)"
        value={otp}
        onChange={handleChange}
        error={otpError}
        maxLength="6"
      />

      <Button type="submit" loading={loading}>
        Xác nhận OTP
      </Button>

      <div className="text-center text-sm">
        <p className="text-gray-600">Chưa nhận được mã?</p>
        <button
          type="button"
          className="text-primary hover:text-primary-dark font-semibold"
          disabled={loading}
        >
          Gửi lại mã OTP
        </button>
      </div>
    </form>
  );
};

export const ForgotPasswordForm = ({ onSubmit, loading, error }) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError("Email không được để trống");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email không hợp lệ");
      return;
    }
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-700">
        <p>Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.</p>
      </div>

      <Input
        type="email"
        label="Email"
        placeholder="Nhập email của bạn"
        value={email}
        onChange={handleChange}
        error={emailError}
      />

      <Button type="submit" loading={loading}>
        Gửi mã OTP
      </Button>

      <div className="text-center">
        <a href="/login" className="text-primary hover:text-primary-dark">
          ← Quay lại đăng nhập
        </a>
      </div>
    </form>
  );
};

export const ResetPasswordForm = ({ email, otp, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.newPassword) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <Input
        type="password"
        name="newPassword"
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        value={formData.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
      />

      <Input
        type="password"
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={errors.confirmPassword}
      />

      <Button type="submit" loading={loading}>
        Đặt lại mật khẩu
      </Button>
    </form>
  );
};

export const UpdateProfileForm = ({ user, onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Tên người dùng không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ (10-11 chữ số)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <div className="bg-gray-100 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Email</p>
        <p className="font-semibold text-gray-900">{user?.email}</p>
        <p className="text-xs text-gray-500 mt-1">
          (Email không thể thay đổi)
        </p>
      </div>

      <Input
        type="text"
        name="username"
        label="Tên người dùng"
        placeholder="Nhập tên người dùng"
        value={formData.username}
        onChange={handleChange}
        error={errors.username}
      />

      <Input
        type="tel"
        name="phone"
        label="Số điện thoại"
        placeholder="Nhập số điện thoại (nếu có)"
        value={formData.phone}
        onChange={handleChange}
        error={errors.phone}
      />

      <Input
        type="text"
        name="bio"
        label="Tiểu sử"
        placeholder="Nhập tiểu sử của bạn (nếu có)"
        value={formData.bio}
        onChange={handleChange}
      />

      <Button type="submit" loading={loading}>
        Cập nhật hồ sơ
      </Button>
    </form>
  );
};
