import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dropdown, Space } from "antd";
import {
  HomeOutlined, UserOutlined, LoginOutlined, LogoutOutlined,
  TeamOutlined, AppstoreOutlined, KeyOutlined, ShoppingOutlined,
} from "@ant-design/icons";
import { FiUser } from "react-icons/fi";
import { useAuth } from "../context/auth.context.jsx";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setAuth({ isAuthenticated: false, user: { id: "", name: "", email: "", role: "" } });
    navigate("/login");
  };

  const NAV_AUTH = [
    { key: "/",        icon: <HomeOutlined />,     label: "Trang chủ"  },
    { key: "/shop",    icon: <ShoppingOutlined />,  label: "Cửa hàng"  },
    { key: "/user",    icon: <TeamOutlined />,      label: "Người dùng" },
  ];
  const NAV_GUEST = [
    { key: "/login",           icon: <LoginOutlined />, label: "Đăng nhập" },
    { key: "/register",        icon: <UserOutlined />,  label: "Đăng ký"   },
    { key: "/forgot-password", icon: <KeyOutlined />,   label: "Quên mật khẩu" },
  ];

  const navItems = auth.isAuthenticated ? NAV_AUTH : NAV_GUEST;

  const dropdownItems = {
    items: [
      {
        key: "info", disabled: true,
        label: (
          <div className="py-1">
            <div className="font-bold text-slate-800">{auth.user.name}</div>
            <div className="text-xs text-slate-400">{auth.user.email}</div>
          </div>
        ),
      },
      { type: "divider" },
      { key: "profile", icon: <FiUser size={14} />, label: "Hồ sơ cá nhân", onClick: () => navigate("/profile") },
      { type: "divider" },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true, onClick: handleLogout },
    ],
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform">
            <AppstoreOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <span className="font-extrabold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LaptopStore
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 ml-1.5 font-medium">BT04</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.key ||
              (item.key === "/shop" && location.pathname.startsWith("/product"));
            return (
              <Link
                key={item.key}
                to={item.key}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium no-underline transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 ml-0.5" />}
              </Link>
            );
          })}
        </nav>

        {/* Right — Avatar or Auth buttons */}
        <div className="flex items-center gap-3">
          {auth.isAuthenticated ? (
            <Dropdown menu={dropdownItems} placement="bottomRight" arrow trigger={["click"]}>
              <button className="flex items-center gap-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl px-3 py-2 cursor-pointer transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {auth.user.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate hidden sm:block">
                  {auth.user.name}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold hidden sm:inline ${auth.user.role === "admin" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                  {auth.user.role === "admin" ? "Admin" : "User"}
                </span>
              </button>
            </Dropdown>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-4 py-2 rounded-xl border border-slate-200 hover:border-indigo-300 no-underline transition-all">
                Đăng nhập
              </Link>
              <Link to="/register"
                className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl no-underline transition-all shadow-md shadow-indigo-200">
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
