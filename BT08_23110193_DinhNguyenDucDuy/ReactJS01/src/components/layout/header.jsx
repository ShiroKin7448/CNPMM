import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Badge, Dropdown } from "antd";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  DashboardOutlined,
  GiftOutlined,
  HeartOutlined,
  HomeOutlined,
  KeyOutlined,
  LoginOutlined,
  LogoutOutlined,
  OrderedListOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { FiUser } from "react-icons/fi";
import { useAuth } from "../context/auth.context.jsx";
import {
  getCartApi,
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../../util/api.js";
import { connectSocket, disconnectSocket } from "../../util/socket.js";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, setAuth } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isAdmin = auth.user.role === "admin";
  const homePath = isAdmin ? "/admin" : "/";

  const loadCartCount = async () => {
    if (!auth.isAuthenticated || isAdmin) {
      setCartCount(0);
      return;
    }

    try {
      const res = await getCartApi();
      if (res?.EC === 0) setCartCount(res.DT.totalItems || 0);
    } catch (error) {
      setCartCount(0);
    }
  };

  const loadNotifications = async () => {
    if (!auth.isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const res = await getNotificationsApi({ limit: 8 });
      if (res?.EC === 0) {
        setNotifications(res.DT.notifications || []);
        setUnreadCount(res.DT.unread || 0);
      }
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const isNotificationVisible = (notification) => {
    if (!notification) return false;
    if (notification.audience === "all") return true;
    if (notification.recipient && notification.recipient === auth.user.id) return true;
    return notification.audience === auth.user.role;
  };

  useEffect(() => {
    loadCartCount();
    window.addEventListener("cart-updated", loadCartCount);
    return () => window.removeEventListener("cart-updated", loadCartCount);
  }, [auth.isAuthenticated, auth.user.role]);

  useEffect(() => {
    loadNotifications();
  }, [auth.isAuthenticated, auth.user.id, auth.user.role]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!auth.isAuthenticated || !token) {
      disconnectSocket();
      return undefined;
    }

    const socket = connectSocket(token);
    const handleNewNotification = (notification) => {
      if (!isNotificationVisible(notification)) return;
      setNotifications((current) => [
        { ...notification, read: false },
        ...current.filter((item) => item._id !== notification._id),
      ].slice(0, 8));
      setUnreadCount((current) => current + 1);
      window.dispatchEvent(new CustomEvent("notification-updated", { detail: notification }));
    };
    const handleAnalyticsRefresh = (payload) => {
      window.dispatchEvent(new CustomEvent("analytics-refresh", { detail: payload }));
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("analytics:refresh", handleAnalyticsRefresh);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("analytics:refresh", handleAnalyticsRefresh);
    };
  }, [auth.isAuthenticated, auth.user.id, auth.user.role]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("checkout_product_ids");
    disconnectSocket();
    setAuth({ isAuthenticated: false, user: { id: "", name: "", email: "", role: "" } });
    setCartCount(0);
    setNotifications([]);
    setUnreadCount(0);
    navigate("/login");
  };

  const NAV_USER = [
    { key: "/", icon: <HomeOutlined />, label: "Trang chủ" },
    { key: "/shop", icon: <ShoppingOutlined />, label: "Cửa hàng" },
    { key: "/orders", icon: <OrderedListOutlined />, label: "Đơn hàng" },
    { key: "/store", icon: <HeartOutlined />, label: "Kho thành viên" },
    { key: "/user", icon: <TeamOutlined />, label: "Người dùng" },
  ];
  const NAV_ADMIN = [
    { key: "/admin", icon: <DashboardOutlined />, label: "Quản trị" },
    { key: "/admin/statistics", icon: <BarChartOutlined />, label: "Thống kê" },
    { key: "/admin/loyalty", icon: <GiftOutlined />, label: "Ưu đãi" },
    { key: "/shop", icon: <ShoppingOutlined />, label: "Cửa hàng" },
    { key: "/user", icon: <TeamOutlined />, label: "Người dùng" },
  ];
  const NAV_GUEST = [
    { key: "/login", icon: <LoginOutlined />, label: "Đăng nhập" },
    { key: "/register", icon: <UserOutlined />, label: "Đăng ký" },
    { key: "/forgot-password", icon: <KeyOutlined />, label: "Quên mật khẩu" },
  ];

  const navItems = auth.isAuthenticated ? (isAdmin ? NAV_ADMIN : NAV_USER) : NAV_GUEST;

  const dropdownItems = {
    items: [
      {
        key: "info",
        disabled: true,
        label: (
          <div className="py-1">
            <div className="font-bold text-slate-800">{auth.user.name}</div>
            <div className="text-xs text-slate-400">{auth.user.email}</div>
          </div>
        ),
      },
      { type: "divider" },
      { key: "profile", icon: <FiUser size={14} />, label: "Hồ sơ cá nhân", onClick: () => navigate("/profile") },
      { key: "notifications", icon: <BellOutlined />, label: "Thông báo", onClick: () => navigate("/notifications") },
      ...(!isAdmin ? [{ key: "store", icon: <GiftOutlined />, label: "Kho thành viên", onClick: () => navigate("/store") }] : []),
      ...(isAdmin ? [{ key: "admin", icon: <DashboardOutlined />, label: "Bảng quản trị", onClick: () => navigate("/admin") }] : []),
      { type: "divider" },
      { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true, onClick: handleLogout },
    ],
  };

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationReadApi(notification._id);
        setNotifications((current) => current.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        ));
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch (error) {
        // Không chặn điều hướng nếu thao tác đánh dấu đã đọc lỗi.
      }
    }
    setNotificationOpen(false);
    if (notification.targetUrl) navigate(notification.targetUrl);
  };

  const markAllNotifications = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      // Giữ nguyên trạng thái local nếu API lỗi.
    }
  };

  const notificationTime = (value) => {
    if (!value) return "";
    return new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  };

  const isActiveNav = (item) => {
    if (item.key === "/") return location.pathname === "/";
    if (item.key === "/admin") return location.pathname === "/admin";
    if (item.key === "/admin/statistics") return location.pathname.startsWith("/admin/statistics");
    if (item.key === "/admin/loyalty") return location.pathname.startsWith("/admin/loyalty");
    if (item.key === "/shop") return location.pathname === "/shop" || location.pathname.startsWith("/product");
    if (item.key === "/orders") return location.pathname.startsWith("/orders");
    return location.pathname === item.key;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to={homePath} className="site-logo-3d group flex items-center gap-2.5 no-underline">
          <div className="logo-cube-3d flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-md shadow-indigo-200 transition-transform group-hover:scale-110">
            <AppstoreOutlined style={{ color: "#fff", fontSize: 18 }} />
          </div>
          <div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-lg font-extrabold text-transparent">
              LaptopStore
            </span>
            <span className="ml-1.5 hidden text-xs font-medium text-slate-400 sm:inline">BT08</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const isActive = isActiveNav(item);
            return (
              <Link
                key={item.key}
                to={item.key}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium no-underline transition-all ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && <div className="ml-0.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {auth.isAuthenticated ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationOpen((open) => !open)}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-black transition hover:border-black hover:bg-[#C0FF6B]"
                  aria-label="Thông báo"
                >
                  <Badge count={unreadCount} size="small" offset={[4, -4]}>
                    <BellOutlined style={{ fontSize: 18, color: "#000" }} />
                  </Badge>
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-12 z-[70] mt-2 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-[#D5D5D5] bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b border-[#D5D5D5] px-4 py-3">
                      <div>
                        <div className="text-sm font-black text-black">Thông báo realtime</div>
                        <div className="text-xs font-bold text-[#656565]">{unreadCount} chưa đọc</div>
                      </div>
                      <button
                        type="button"
                        onClick={markAllNotifications}
                        className="rounded-full border border-[#D5D5D5] px-3 py-1 text-xs font-extrabold text-black hover:border-black"
                      >
                        Đánh dấu đọc
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto p-2">
                      {notifications.length ? notifications.map((item) => (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => openNotification(item)}
                          className={`mb-2 w-full rounded-2xl border p-3 text-left transition hover:border-black ${
                            item.read ? "border-[#E5E5E5] bg-white" : "border-black bg-[#F6FFE8]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="line-clamp-2 text-sm font-black text-black">{item.title}</div>
                              <div className="mt-1 line-clamp-2 text-xs font-bold text-[#656565]">{item.message}</div>
                            </div>
                            {!item.read && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#C0FF6B] ring-2 ring-black" />}
                          </div>
                          <div className="mt-2 text-[11px] font-extrabold uppercase text-[#656565]">
                            {item.type} · {notificationTime(item.createdAt)}
                          </div>
                        </button>
                      )) : (
                        <div className="rounded-2xl bg-[#f6f6f6] p-5 text-center text-sm font-bold text-[#656565]">
                          Chưa có thông báo.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNotificationOpen(false);
                        navigate("/notifications");
                      }}
                      className="w-full border-t border-[#D5D5D5] bg-black px-4 py-3 text-sm font-black text-[#C0FF6B]"
                    >
                      Xem tất cả thông báo
                    </button>
                  </div>
                )}
              </div>

              {!isAdmin && (
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-black transition hover:border-black hover:bg-[#C0FF6B]"
                  aria-label="Giỏ hàng"
                >
                  <Badge count={cartCount} size="small" offset={[4, -4]}>
                    <ShoppingCartOutlined style={{ fontSize: 18, color: "#000" }} />
                  </Badge>
                </button>
              )}

              <Dropdown menu={dropdownItems} placement="bottomRight" arrow trigger={["click"]}>
                <button className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 transition-all hover:border-indigo-200 hover:bg-indigo-50">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                    {auth.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden max-w-[100px] truncate text-sm font-semibold text-slate-700 sm:block">
                    {auth.user.name}
                  </span>
                  <span className={`hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline ${isAdmin ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"}`}>
                    {isAdmin ? "Admin" : "User"}
                  </span>
                </button>
              </Dropdown>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 no-underline transition-all hover:border-indigo-300 hover:text-indigo-600">
                Đăng nhập
              </Link>
              <Link to="/register" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white no-underline shadow-md shadow-indigo-200 transition-all hover:bg-indigo-700">
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
