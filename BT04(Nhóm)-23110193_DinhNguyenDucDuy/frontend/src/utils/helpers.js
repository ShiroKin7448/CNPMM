// Validation helpers
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
};

// Error messages
export const getErrorMessage = (error, fieldName) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  const errorMessages = {
    email: "Email không hợp lệ",
    password: "Mật khẩu phải có ít nhất 6 ký tự",
    username: "Tên người dùng phải có ít nhất 3 ký tự",
    phone: "Số điện thoại không hợp lệ",
    otp: "Mã OTP không đúng hoặc đã hết hạn",
  };

  return errorMessages[fieldName] || "Có lỗi xảy ra";
};

// Format functions
export const formatPhoneNumber = (phone) => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
};

// Date helpers
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

export const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return "Vừa đây";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

  return formatDate(date);
};
