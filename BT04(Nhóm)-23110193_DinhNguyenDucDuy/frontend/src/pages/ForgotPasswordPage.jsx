import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ForgotPasswordForm,
  OTPVerificationForm,
  ResetPasswordForm,
} from "../components/Forms";
import { Card, Header, Alert } from "../components/UI";
import { useAuth } from "../redux/hooks";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { forgotPassword, resetPassword, isLoading, error } = useAuth();

  const handleForgotPassword = async (userEmail) => {
    try {
      await forgotPassword(userEmail);
      setEmail(userEmail);
      setSuccessMessage("Mã OTP đã được gửi đến email của bạn.");
      setStep("otp");
    } catch (err) {
      console.error("Forgot password failed:", err);
    }
  };

  const handleOTPVerification = async (otpCode) => {
    try {
      setOtp(otpCode);
      setSuccessMessage("Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.");
      setStep("reset");
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  const handleResetPassword = async (formData) => {
    try {
      await resetPassword(email, otp, formData.newPassword);
      setSuccessMessage(
        "Mật khẩu đã được đặt lại thành công! Đang chuyển hướng...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("Reset password failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Header title="Quên mật khẩu" subtitle="Đặt lại mật khẩu của bạn" />

        <Card>
          {successMessage && <Alert type="success" message={successMessage} />}

          {step === "forgot" && (
            <ForgotPasswordForm
              onSubmit={handleForgotPassword}
              loading={isLoading}
              error={error}
            />
          )}

          {step === "otp" && (
            <OTPVerificationForm
              email={email}
              onSubmit={handleOTPVerification}
              loading={isLoading}
              error={error}
            />
          )}

          {step === "reset" && (
            <ResetPasswordForm
              email={email}
              otp={otp}
              onSubmit={handleResetPassword}
              loading={isLoading}
              error={error}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
