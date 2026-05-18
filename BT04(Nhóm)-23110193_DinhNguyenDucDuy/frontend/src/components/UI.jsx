import React from "react";

export { Header } from "./Layout";

export const Input = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition ${
          error
            ? "border-danger focus:ring-danger"
            : "border-gray-300 focus:ring-primary"
        }`}
      />
      {error && <p className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
};

export const Button = ({
  children,
  variant = "primary",
  loading,
  disabled,
  ...props
}) => {
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-gray-500 hover:bg-gray-600 text-white",
    danger: "bg-danger hover:bg-red-600 text-white",
    outline:
      "bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`w-full py-2 px-4 rounded-lg font-semibold transition ${variants[variant]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {loading ? "⏳ Đang xử lý..." : children}
    </button>
  );
};

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
};

export const Alert = ({ type = "info", message }) => {
  const typeStyles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700",
  };

  return (
    <div className={`border-l-4 p-4 rounded ${typeStyles[type]}`}>
      {message}
    </div>
  );
};

export const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export const Link = ({ to, children, ...props }) => {
  return (
    <a
      href={to}
      {...props}
      className={`text-primary hover:text-primary-dark underline ${props.className || ""}`}
    >
      {children}
    </a>
  );
};
