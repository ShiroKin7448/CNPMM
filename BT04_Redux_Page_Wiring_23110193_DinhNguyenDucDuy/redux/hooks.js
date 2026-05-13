import { useDispatch, useSelector } from "react-redux";
import { authAPI } from "../services/api";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  verifyOTPStart,
  verifyOTPSuccess,
  verifyOTPFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  getProfileStart,
  getProfileSuccess,
  getProfileFailure,
  updateProfileStart,
  updateProfileSuccess,
  updateProfileFailure,
  logout,
} from "./authSlice";

export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;

const logApiError = (action, error, payload) => {
  console.error(`[auth:${action}] failed`, {
    message: error?.message,
    status: error?.response?.status,
    responseData: error?.response?.data,
    payload,
  });
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((item) => item?.msg || item?.message || "Lỗi không xác định")
      .join(" | ");
  }

  return (
    responseData?.details ||
    responseData?.message ||
    error?.message ||
    fallbackMessage
  );
};

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const login = async (email, password) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.login({ email, password });
      const user = {
        email,
        role: response.data.role,
      };
      dispatch(
        loginSuccess({ user, token: response.data.accessToken || "jwt-token" }),
      );
      return response.data;
    } catch (error) {
      logApiError("login", error, { email });
      const errorMessage = getApiErrorMessage(error, "Đăng nhập thất bại");
      dispatch(loginFailure(errorMessage));
      throw error;
    }
  };

  const register = async (username, email, password) => {
    dispatch(registerStart());
    try {
      const response = await authAPI.register({ username, email, password });
      dispatch(registerSuccess());
      return response.data;
    } catch (error) {
      logApiError("register", error, { username, email });
      const errorMessage = getApiErrorMessage(error, "Đăng ký thất bại");
      dispatch(registerFailure(errorMessage));
      throw error;
    }
  };

  const verifyOTP = async (email, otp) => {
    dispatch(verifyOTPStart());
    try {
      const response = await authAPI.verifyOTP(email, otp);
      const user = {
        email,
        role: response.data.role || "user",
      };
      dispatch(
        verifyOTPSuccess({
          user,
          token: response.data.accessToken || "jwt-token",
        }),
      );
      return response.data;
    } catch (error) {
      logApiError("verify-otp", error, { email, otp });
      const errorMessage = getApiErrorMessage(error, "Xác thực OTP thất bại");
      dispatch(verifyOTPFailure(errorMessage));
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    dispatch(forgotPasswordStart());
    try {
      const response = await authAPI.forgotPassword(email);
      dispatch(forgotPasswordSuccess());
      return response.data;
    } catch (error) {
      logApiError("forgot-password", error, { email });
      const errorMessage = getApiErrorMessage(error, "Gửi yêu cầu thất bại");
      dispatch(forgotPasswordFailure(errorMessage));
      throw error;
    }
  };

  const resetPassword = async (email, otp, newPassword) => {
    dispatch(resetPasswordStart());
    try {
      const response = await authAPI.resetPassword({ email, otp, newPassword });
      dispatch(resetPasswordSuccess());
      return response.data;
    } catch (error) {
      logApiError("reset-password", error, { email, otp });
      const errorMessage = getApiErrorMessage(
        error,
        "Đặt lại mật khẩu thất bại",
      );
      dispatch(resetPasswordFailure(errorMessage));
      throw error;
    }
  };

  const getProfile = async () => {
    dispatch(getProfileStart());
    try {
      const response = await authAPI.getProfile();
      dispatch(getProfileSuccess(response.data));
      return response.data;
    } catch (error) {
      logApiError("get-profile", error, {});
      const errorMessage = getApiErrorMessage(error, "Lấy thông tin thất bại");
      dispatch(getProfileFailure(errorMessage));
      throw error;
    }
  };

  const updateProfile = async (userData) => {
    dispatch(updateProfileStart());
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch(updateProfileSuccess(response.data));
      return response.data;
    } catch (error) {
      logApiError("update-profile", error, userData);
      const errorMessage = getApiErrorMessage(error, "Cập nhật thất bại");
      dispatch(updateProfileFailure(errorMessage));
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return {
    ...auth,
    login,
    register,
    verifyOTP,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    logout: handleLogout,
  };
};
