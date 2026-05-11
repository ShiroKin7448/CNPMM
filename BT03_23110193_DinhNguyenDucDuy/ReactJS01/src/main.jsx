import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import viVN from "antd/locale/vi_VN";

import "./styles/global.css";

import App from "./App.jsx";
import Home from "./pages/home.jsx";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import UserPage from "./pages/user.jsx";
import ForgotPassword from "./pages/forgot-password.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";

// Cấu hình React Router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "user",
        element: <UserPage />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },
]);

// Ant Design dark theme configuration
const antdDarkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#6366f1",
    colorLink: "#6366f1",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorBgBase: "#0f0f1a",
    colorBgContainer: "#1a1a2e",
    colorBgElevated: "#16213e",
    colorBorder: "rgba(255,255,255,0.1)",
    colorText: "#f8fafc",
    colorTextSecondary: "#94a3b8",
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Table: {
      headerBg: "#16213e",
      rowHoverBg: "rgba(99,102,241,0.08)",
      colorBgContainer: "#1a1a2e",
    },
    Menu: {
      darkItemBg: "transparent",
      darkSubMenuItemBg: "transparent",
      darkItemSelectedBg: "rgba(99,102,241,0.2)",
    },
    Button: {
      borderRadius: 10,
    },
    Input: {
      colorBgContainer: "rgba(255,255,255,0.05)",
    },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={antdDarkTheme} locale={viVN}>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </ConfigProvider>
  </StrictMode>
);
