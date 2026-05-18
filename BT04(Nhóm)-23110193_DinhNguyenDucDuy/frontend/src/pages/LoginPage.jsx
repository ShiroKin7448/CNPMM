import React from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/Forms";
import { Card, Header } from "../components/UI";
import { useAuth } from "../redux/hooks";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();

  const handleLogin = async (formData) => {
    try {
      const response = await login(formData.email, formData.password);
      if (response.role === "admin") {
        navigate("/admin/profile");
      } else {
        navigate("/user/profile");
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Header title="Đăng nhập" subtitle="Đăng nhập vào tài khoản của bạn" />
        <Card>
          <LoginForm onSubmit={handleLogin} loading={isLoading} error={error} />
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
