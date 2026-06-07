import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { BellOutlined, CheckCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { useAuth } from "../components/context/auth.context.jsx";
import {
  getNotificationsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
} from "../util/api.js";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const typeLabel = {
  ORDER_NEW: "Đơn mới",
  ORDER_STATUS: "Trạng thái đơn",
  ORDER_CANCEL_REQUESTED: "Yêu cầu hủy",
  REVIEW_NEW: "Đánh giá",
  USER_NEW: "Khách mới",
  PRODUCT_NEW: "Sản phẩm",
  VOUCHER_NEW: "Voucher",
  SYSTEM: "Hệ thống",
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsApi({ limit: 40 });
      if (res?.EC === 0) {
        setNotifications(res.DT.notifications || []);
        setUnread(res.DT.unread || 0);
      }
    } catch (error) {
      message.error(error?.EM || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    loadNotifications();
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const refresh = () => loadNotifications();
    window.addEventListener("notification-updated", refresh);
    return () => window.removeEventListener("notification-updated", refresh);
  }, []);

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationReadApi(notification._id);
        setNotifications((current) => current.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item
        ));
        setUnread((current) => Math.max(0, current - 1));
      } catch (error) {
        message.error(error?.EM || "Không thể đánh dấu đã đọc");
      }
    }
    if (notification.targetUrl) navigate(notification.targetUrl);
  };

  const markAll = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnread(0);
    } catch (error) {
      message.error(error?.EM || "Không thể đánh dấu tất cả");
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black bg-[#C0FF6B] px-4 py-1 text-xs font-black uppercase text-black">
              <BellOutlined /> BT08 REALTIME
            </div>
            <h1 className="mt-3 text-3xl font-black text-black">Thông Báo Ứng Dụng</h1>
            <p className="mt-1 text-sm font-bold text-[#656565]">
              Lưu lại các hoạt động mới: đơn hàng, đánh giá, khách hàng, sản phẩm và voucher.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D5D5D5] bg-white px-4 py-2 text-sm font-extrabold text-black hover:border-black"
            >
              <ReloadOutlined /> Làm mới
            </button>
            <button
              type="button"
              onClick={markAll}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-extrabold text-[#C0FF6B]"
            >
              <CheckCircleOutlined /> Đánh dấu tất cả ({unread})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-3xl bg-white/80" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => openNotification(item)}
                className={`w-full rounded-3xl border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-black ${
                  item.read ? "border-[#D5D5D5] bg-white" : "border-black bg-[#F6FFE8]"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-black px-3 py-1 text-[11px] font-black uppercase text-[#C0FF6B]">
                        {typeLabel[item.type] || item.type}
                      </span>
                      {!item.read && <span className="rounded-full bg-[#C0FF6B] px-3 py-1 text-[11px] font-black uppercase text-black">Mới</span>}
                    </div>
                    <h2 className="mt-3 text-lg font-black text-black">{item.title}</h2>
                    <p className="mt-1 text-sm font-bold text-[#656565]">{item.message}</p>
                  </div>
                  <div className="text-xs font-extrabold text-[#656565]">{formatDate(item.createdAt)}</div>
                </div>
              </button>
            ))}

            {!notifications.length && (
              <div className="rounded-3xl border border-[#D5D5D5] bg-white p-10 text-center text-sm font-bold text-[#656565]">
                Chưa có thông báo nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
