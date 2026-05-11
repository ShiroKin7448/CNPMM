import { Link, useNavigate } from "react-router-dom";
import { Menu, Avatar, Dropdown, Space, Typography } from "antd";
import {
  HomeOutlined,
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  TeamOutlined,
  AppstoreOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/auth.context.jsx";

const { Text } = Typography;

const Header = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useAuth();

  const handleLogout = () => {
    // Xóa token khỏi localStorage
    localStorage.removeItem("access_token");

    // Reset auth state
    setAuth({
      isAuthenticated: false,
      user: { id: "", name: "", email: "", role: "" },
    });

    navigate("/login");
  };

  // Menu items cho user chưa đăng nhập
  const guestMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "login",
      icon: <LoginOutlined />,
      label: <Link to="/login">Đăng nhập</Link>,
    },
    {
      key: "register",
      icon: <UserOutlined />,
      label: <Link to="/register">Đăng ký</Link>,
    },
    {
      key: "forgot-password",
      icon: <KeyOutlined />,
      label: <Link to="/forgot-password">Quên mật khẩu</Link>,
    },
  ];

  // Menu items cho user đã đăng nhập
  const authMenuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <Link to="/">Trang chủ</Link>,
    },
    {
      key: "user",
      icon: <TeamOutlined />,
      label: <Link to="/user">Quản lý User</Link>,
    },
  ];

  // Dropdown menu cho avatar
  const userDropdownItems = {
    items: [
      {
        key: "profile",
        icon: <UserOutlined />,
        label: (
          <div>
            <div style={{ fontWeight: 600 }}>{auth.user.name}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>
              {auth.user.email}
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: "divider" },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Đăng xuất",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <header
      style={{
        background: "rgba(15, 15, 26, 0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(99, 102, 241, 0.2)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppstoreOutlined style={{ color: "#fff", fontSize: "18px" }} />
          </div>
          <span
            style={{
              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              fontSize: "18px",
              letterSpacing: "-0.5px",
            }}
          >
            BT03 FullStack
          </span>
        </div>
      </Link>

      {/* Navigation Menu */}
      <Menu
        mode="horizontal"
        selectedKeys={[]}
        items={auth.isAuthenticated ? authMenuItems : guestMenuItems}
        style={{
          background: "transparent",
          border: "none",
          flex: 1,
          justifyContent: "center",
          color: "#f8fafc",
        }}
        theme="dark"
      />

      {/* Right Section - User or Auth buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {auth.isAuthenticated ? (
          <Dropdown menu={userDropdownItems} placement="bottomRight" arrow>
            <Space
              style={{ cursor: "pointer", gap: "8px" }}
            >
              <Avatar
                style={{
                  background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                  fontWeight: 600,
                }}
                size="default"
              >
                {auth.user.name?.charAt(0)?.toUpperCase() || "U"}
              </Avatar>
              <Text style={{ color: "#f8fafc", fontWeight: 500 }}>
                {auth.user.name}
              </Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Link
              to="/login"
              style={{
                color: "#94a3b8",
                fontWeight: 500,
                textDecoration: "none",
                padding: "6px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.1)",
                transition: "all 0.3s",
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              style={{
                background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                color: "#fff",
                fontWeight: 600,
                textDecoration: "none",
                padding: "6px 16px",
                borderRadius: "8px",
                transition: "all 0.3s",
              }}
            >
              Đăng ký
            </Link>
          </Space>
        )}
      </div>
    </header>
  );
};

export default Header;
