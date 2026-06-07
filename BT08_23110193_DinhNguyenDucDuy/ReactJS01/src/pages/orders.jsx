import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";
import { FiClock, FiEye, FiPackage, FiXCircle } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import CancelOrderModal from "../components/order/CancelOrderModal.jsx";
import { getOrdersApi } from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const STATUS_CLASS = {
  NEW: "bg-blue-50 text-blue-700 border-blue-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PREPARING: "bg-amber-50 text-amber-700 border-amber-100",
  SHIPPING: "bg-purple-50 text-purple-700 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700 border-orange-100",
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrdersApi();
      if (res?.EC === 0) setOrders(res.DT);
    } catch (error) {
      message.error(error?.EM || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-black">Đơn Hàng Của Tôi</h1>
          <p className="mt-1 text-sm font-semibold text-[#656565]">Lịch sử mua hàng và trạng thái giao hàng</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-3xl bg-white/80" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-[#D5D5D5] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
              <FiPackage size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-black">Chưa có đơn hàng</h2>
            <Link
              to="/shop"
              className="mt-6 inline-flex rounded-2xl bg-black px-6 py-3 text-sm font-extrabold text-[#C0FF6B] no-underline transition hover:bg-[#C0FF6B] hover:text-black"
            >
              Mua hàng
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order._id} className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-black text-black">#{order.orderCode}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${STATUS_CLASS[order.status] || "bg-white text-black border-[#D5D5D5]"}`}>
                        {order.statusLabel}
                      </span>
                      <span className="rounded-full border border-[#D5D5D5] bg-[#f6f6f6] px-3 py-1 text-xs font-extrabold text-black">
                        {order.paymentMethodLabel}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#656565]">
                      <FiClock size={14} />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-xs font-bold uppercase text-[#656565]">Tổng thanh toán</div>
                    <div className="text-xl font-black text-black">{fmt(order.total)}</div>
                    <div className="text-xs font-bold text-[#656565]">{order.paymentStatusLabel}</div>
                    {order.paymentMethod === "MOMO" && order.paymentStatus === "PENDING" && order.momoPaymentExpiresAt && (
                      <div className="text-xs font-bold text-pink-700">Hạn MoMo: {formatDate(order.momoPaymentExpiresAt)}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={`${order._id}-${item.product}`} className="grid grid-cols-[54px_1fr] gap-3 rounded-2xl bg-[#f6f6f6] p-2">
                      <img src={item.image || "https://via.placeholder.com/160x120?text=No+Image"} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-extrabold text-black">{item.name}</div>
                        <div className="mt-1 text-xs font-bold text-[#656565]">x{item.quantity} · {fmt(item.total)}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                  {order.cancelPolicy?.canCancel && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(order)}
                      className="inline-flex items-center gap-2 rounded-full border border-[#D5D5D5] px-4 py-2 text-sm font-extrabold text-black transition hover:border-black"
                    >
                      <FiXCircle size={15} />
                      {order.cancelPolicy.action === "request" ? "Gửi yêu cầu hủy" : "Hủy trực tiếp"}
                    </button>
                  )}
                  <Link
                    to={`/orders/${order._id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-extrabold text-[#C0FF6B] no-underline transition hover:bg-[#C0FF6B] hover:text-black"
                  >
                    <FiEye size={15} /> Theo dõi
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <CancelOrderModal
          order={cancelTarget}
          open={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          onSuccess={(updatedOrder) => {
            setOrders((prev) => prev.map((item) => item._id === updatedOrder._id ? updatedOrder : item));
            loadOrders();
          }}
        />
      </div>
    </div>
  );
};

export default OrdersPage;
