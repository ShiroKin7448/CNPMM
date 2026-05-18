import React from "react";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-danger mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang này.
          </p>
          <a href="/" className="text-primary hover:text-primary-dark">
            ← Quay lại trang chủ
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    const redirectUrl =
      user?.role === "admin" ? "/admin/profile" : "/user/profile";
    window.location.href = redirectUrl;
    return null;
  }

  return children;
};
