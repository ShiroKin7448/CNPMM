import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm, OTPVerificationForm } from "../components/Forms";
import { Card, Header, Alert } from "../components/UI";
import { useAuth } from "../redux/hooks";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { register, verifyOTP, isLoading, error } = useAuth();

  const handleRegister = async (formData) => {
    try {
      await register(formData.username, formData.email, formData.password);
      setRegisteredEmail(formData.email);
      setSuccessMessage(
        "Đăng ký thành công! Vui lòng xác nhận OTP để kích hoạt tài khoản.",
      );
      setStep("otp");
    } catch (err) {
      console.error("Register failed:", err);
    }
  };

  const handleOTPVerification = async (otp) => {
    try {
      await verifyOTP(registeredEmail, otp);
      setSuccessMessage(
        "Tài khoản đã được kích hoạt! Đang chuyển hướng đến đăng nhập...",
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error("OTP verification failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Header title="Đăng ký" subtitle="Tạo tài khoản mới" />

        <Card>
          {successMessage && <Alert type="success" message={successMessage} />}

          {step === "register" && (
            <RegisterForm
              onSubmit={handleRegister}
              loading={isLoading}
              error={error}
            />
          )}

          {step === "otp" && (
            <OTPVerificationForm
              email={registeredEmail}
              onSubmit={handleOTPVerification}
              loading={isLoading}
              error={error}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
