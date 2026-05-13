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
import ResetPassword from "./pages/reset-password.jsx";
import ShopPage from "./pages/shop.jsx";
import ProductDetailPage from "./pages/product-detail.jsx";
import ProfilePage from "./pages/profile.jsx";
import { AuthWrapper } from "./components/context/auth.context.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true,                     element: <Home />              },
      { path: "login",                   element: <Login />             },
      { path: "register",                element: <Register />          },
      { path: "user",                    element: <UserPage />          },
      { path: "forgot-password",         element: <ForgotPassword />    },
      { path: "reset-password/:token",   element: <ResetPassword />     },
      { path: "shop",                    element: <ShopPage />          },
      { path: "product/:id",             element: <ProductDetailPage /> },
      { path: "profile",                 element: <ProfilePage />       },
    ],
  },
]);

// Light theme cho Ant Design
const antdLightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: "#4F46E5",
    colorLink: "#4F46E5",
    colorSuccess: "#10B981",
    colorWarning: "#F59E0B",
    colorError: "#EF4444",
    colorBgBase: "#ffffff",
    colorBgContainer: "#ffffff",
    borderRadius: 10,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigProvider theme={antdLightTheme} locale={viVN}>
      <AuthWrapper>
        <RouterProvider router={router} />
      </AuthWrapper>
    </ConfigProvider>
  </StrictMode>
);
