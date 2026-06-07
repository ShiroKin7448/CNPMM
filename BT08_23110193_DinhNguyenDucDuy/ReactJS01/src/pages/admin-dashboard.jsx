import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, message, Modal, Select } from "antd";
import {
  FiCheck, FiCreditCard, FiDollarSign, FiPackage, FiRefreshCw,
  FiEye, FiMapPin, FiSearch, FiShoppingBag, FiTruck, FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import { getAdminDashboardApi, getAdminOrdersApi, updateOrderStatusApi } from "../util/api.js";

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

const STATUS_LABELS = {
  NEW: "Đơn hàng mới",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  DELIVERED: "Đã giao",
  CANCELLED: "Đã hủy",
  CANCEL_REQUESTED: "Yêu cầu hủy",
};

const STATUS_CLASS = {
  NEW: "bg-blue-50 text-blue-700 border-blue-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PREPARING: "bg-amber-50 text-amber-700 border-amber-100",
  SHIPPING: "bg-purple-50 text-purple-700 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-red-50 text-red-700 border-red-100",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700 border-orange-100",
};

const getActions = (order) => {
  const canProcess = order.paymentMethod === "COD" || order.paymentStatus === "PAID";
  switch (order.status) {
    case "NEW":
      return [
        ...(canProcess ? [{ status: "CONFIRMED", label: "Xác nhận", icon: <FiCheck size={14} /> }] : []),
        { status: "CANCELLED", label: "Hủy", danger: true, icon: <FiXCircle size={14} /> },
      ];
    case "CONFIRMED":
      return [
        ...(canProcess ? [{ status: "PREPARING", label: "Chuẩn bị hàng", icon: <FiPackage size={14} /> }] : []),
        { status: "CANCELLED", label: "Hủy", danger: true, icon: <FiXCircle size={14} /> },
      ];
    case "PREPARING":
      return [
        { status: "SHIPPING", label: "Giao hàng", icon: <FiTruck size={14} /> },
        { status: "CANCELLED", label: "Hủy", danger: true, icon: <FiXCircle size={14} /> },
      ];
    case "CANCEL_REQUESTED":
      return [
        { status: "CANCELLED", label: "Duyệt hủy", danger: true, icon: <FiCheck size={14} /> },
        { status: "PREPARING", label: "Từ chối", icon: <FiRefreshCw size={14} /> },
      ];
    case "SHIPPING":
      return [
        { status: "DELIVERED", label: "Đã giao", icon: <FiCheck size={14} /> },
      ];
    case "CANCELLED":
      if (order.paymentMethod === "MOMO" && order.paymentStatus === "REFUND_PENDING") {
        return [
          { status: "CANCELLED", label: "Hoàn tiền MoMo", danger: true, icon: <FiRefreshCw size={14} /> },
        ];
      }
      return [];
    default:
      return [];
  }
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [filters, setFilters] = useState({ status: "", search: "" });
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusNote, setStatusNote] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState([]);

  const orderParams = useMemo(() => ({
    page: 1,
    limit: 20,
    status: filters.status || undefined,
    search: filters.search || undefined,
  }), [filters.status, filters.search]);

  const loadDashboard = async () => {
    try {
      const res = await getAdminDashboardApi();
      if (res?.EC === 0) setDashboard(res.DT);
    } catch (error) {
      message.error(error?.EM || "Không thể tải dashboard admin");
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getAdminOrdersApi(orderParams);
      if (res?.EC === 0) setOrders(res.DT.orders);
    } catch (error) {
      message.error(error?.EM || "Không thể tải danh sách đơn hàng");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    if (auth.user.role !== "admin") {
      navigate("/");
      return;
    }

    const load = async () => {
      setLoading(true);
      await Promise.all([loadDashboard(), loadOrders()]);
      setLoading(false);
    };
    load();
  }, [auth.isAuthenticated, auth.user.role]);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user.role === "admin") loadOrders();
  }, [orderParams]);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.user.role !== "admin") return undefined;
    const refresh = () => Promise.all([loadDashboard(), loadOrders()]);
    window.addEventListener("analytics-refresh", refresh);
    return () => window.removeEventListener("analytics-refresh", refresh);
  }, [auth.isAuthenticated, auth.user.role, orderParams]);

  const openStatusModal = (order, action) => {
    setStatusTarget({ order, action });
    setStatusNote(
      action.status === "CANCELLED"
        ? order.cancelReason || (order.paymentMethod === "MOMO" && ["PAID", "REFUND_PENDING"].includes(order.paymentStatus) ? "Duyệt hủy và hoàn tiền qua MoMo sandbox" : "")
        : ""
    );
  };

  const submitStatus = async () => {
    setUpdatingStatus(true);
    try {
      const res = await updateOrderStatusApi(statusTarget.order._id, statusTarget.action.status, statusNote);
      if (res?.EC === 0) {
        message.success(res.EM);
        setStatusTarget(null);
        setStatusNote("");
        await Promise.all([loadDashboard(), loadOrders()]);
      } else {
        message.error(res?.EM || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      message.error(error?.EM || "Không thể cập nhật trạng thái");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleOrderDetail = (orderId) => {
    setExpandedOrders((current) => current.includes(orderId)
      ? current.filter((id) => id !== orderId)
      : [...current, orderId]);
  };

  if (!auth.isAuthenticated || auth.user.role !== "admin") return null;

  const totals = dashboard?.totals || {};

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Quản Trị Shop</h1>
            <p className="mt-1 text-sm font-semibold text-[#656565]">
              Kiểm soát đơn hàng, trạng thái xử lý, thanh toán và tồn kho
            </p>
          </div>
          <button
            type="button"
            onClick={() => Promise.all([loadDashboard(), loadOrders()])}
            className="inline-flex items-center gap-2 rounded-xl border border-[#D5D5D5] bg-white px-4 py-2 text-sm font-extrabold text-black transition hover:border-black"
          >
            <FiRefreshCw size={15} /> Làm mới
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Tổng đơn", value: totals.orders || 0, icon: <FiShoppingBag />, hint: `${totals.cancelRequests || 0} yêu cầu hủy` },
            { label: "Tiền đã thu", value: fmt(totals.paidRevenue || 0), icon: <FiDollarSign />, hint: "Ví điện tử + COD đã giao" },
            { label: "COD chờ thu", value: fmt(totals.pendingCOD || 0), icon: <FiCreditCard />, hint: "Chưa giao/chưa thanh toán" },
            { label: "MoMo chờ trả", value: fmt(totals.momoPending || 0), icon: <FiCreditCard />, hint: "Đã tạo link, chưa thu tiền" },
            { label: "Chờ hoàn tiền", value: fmt(totals.refundPending || 0), icon: <FiRefreshCw />, hint: "Yêu cầu hủy MoMo đã thu tiền" },
            { label: "Đã hoàn tiền", value: fmt(totals.refundedAmount || 0), icon: <FiRefreshCw />, hint: "Hoàn tiền MoMo thành công" },
            { label: "Giá trị tồn kho", value: fmt(totals.inventoryValue || 0), icon: <FiPackage />, hint: `${totals.lowStock || 0} sản phẩm sắp hết` },
            { label: "Voucher đang chạy", value: totals.activeVouchers || 0, icon: <FiCreditCard />, hint: `${totals.members || 0} khách thành viên` },
            { label: "Bình luận", value: totals.reviews || 0, icon: <FiEye />, hint: "Đánh giá từ đơn giao thành công" },
          ].map((item) => (
            <section key={item.label} className="rounded-2xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-[#C0FF6B]">
                {item.icon}
              </div>
              <div className="text-xs font-extrabold uppercase text-[#656565]">{item.label}</div>
              <div className="mt-1 text-2xl font-black text-black">{item.value}</div>
              <div className="mt-1 text-xs font-bold text-[#656565]">{item.hint}</div>
            </section>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
          <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-xl font-extrabold text-black">Đơn Hàng</h2>
              <div className="grid gap-2 sm:grid-cols-[220px_220px]">
                <Input
                  prefix={<FiSearch size={14} />}
                  placeholder="Mã đơn, tên, SĐT"
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                />
                <Select
                  value={filters.status || "ALL"}
                  onChange={(value) => setFilters((prev) => ({ ...prev, status: value === "ALL" ? "" : value }))}
                  options={[
                    { value: "ALL", label: "Tất cả trạng thái" },
                    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
                  ]}
                />
              </div>
            </div>

            {loading || ordersLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-32 animate-pulse rounded-2xl bg-[#f6f6f6]" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <article key={order._id} className="rounded-2xl border border-[#D5D5D5] p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-black">#{order.orderCode}</span>
                          <span className={`rounded-full border px-3 py-1 text-xs font-extrabold ${STATUS_CLASS[order.status]}`}>
                            {order.statusLabel}
                          </span>
                          <span className="rounded-full border border-[#D5D5D5] bg-[#f6f6f6] px-3 py-1 text-xs font-extrabold text-black">
                            {order.paymentMethodLabel}
                          </span>
                          <span className="rounded-full border border-[#D5D5D5] bg-white px-3 py-1 text-xs font-extrabold text-[#656565]">
                            {order.paymentStatusLabel}
                          </span>
                        </div>
                        <div className="mt-2 text-sm font-bold text-[#656565]">
                          {order.user?.name || order.shippingAddress.fullName} · {order.shippingAddress.phone}
                        </div>
                        <div className="mt-1 text-xs font-bold text-[#656565]">{formatDate(order.createdAt)}</div>
                        {order.cancelReason && (
                          <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-bold text-orange-700">
                            Lý do hủy: {order.cancelReason}
                          </div>
                        )}
                        {order.paymentInfo?.transId && (
                          <div className="mt-1 text-xs font-bold text-[#656565]">
                            MoMo transId: {order.paymentInfo.transId}
                          </div>
                        )}
                        {order.paymentInfo?.refundTransId && (
                          <div className="mt-1 text-xs font-bold text-[#656565]">
                            Refund transId: {order.paymentInfo.refundTransId}
                          </div>
                        )}
                      </div>

                      <div className="text-left lg:text-right">
                        <div className="text-xl font-black text-black">{fmt(order.total)}</div>
                        <div className="text-xs font-bold text-[#656565]">{order.items.length} sản phẩm</div>
                      </div>
                    </div>

                    {expandedOrders.includes(order._id) && (
                      <div className="mt-4 grid gap-4 rounded-2xl bg-[#f6f6f6] p-4 lg:grid-cols-[1fr_280px]">
                        <div className="space-y-2">
                          <div className="text-xs font-extrabold uppercase text-[#656565]">Sản phẩm trong đơn</div>
                          {order.items.map((item) => (
                            <div key={`${order._id}-${item.product}`} className="grid grid-cols-[48px_1fr_auto] gap-3 rounded-xl bg-white p-2">
                              <img src={item.image || "https://via.placeholder.com/120x90?text=No+Image"} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                              <div><div className="line-clamp-2 text-sm font-extrabold text-black">{item.name}</div><div className="text-xs font-bold text-[#656565]">x{item.quantity}</div></div>
                              <b className="text-sm text-black">{fmt(item.total)}</b>
                            </div>
                          ))}
                        </div>
                        <div className="rounded-xl bg-white p-3">
                          <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-[#656565]"><FiMapPin /> Giao đến</div>
                          <div className="mt-2 text-sm font-black text-black">{order.shippingAddress.fullName}</div>
                          <div className="mt-1 text-xs font-bold text-[#656565]">{order.shippingAddress.phone}</div>
                          <div className="mt-1 text-sm font-bold text-[#656565]">{order.shippingAddress.address}</div>
                          {order.shippingAddress.note && <div className="mt-2 text-xs font-bold text-[#656565]">Ghi chú: {order.shippingAddress.note}</div>}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleOrderDetail(order._id)}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D5D5D5] bg-white px-4 py-2 text-xs font-extrabold text-black transition hover:border-black"
                      >
                        <FiEye size={14} /> {expandedOrders.includes(order._id) ? "Thu gọn" : "Xem sản phẩm & vị trí"}
                      </button>
                      {getActions(order).map((action) => (
                        <button
                          key={`${order._id}-${action.status}-${action.label}`}
                          type="button"
                          onClick={() => openStatusModal(order, action)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                            action.danger
                              ? "border-red-200 bg-red-50 text-red-700 hover:border-red-500"
                              : "border-[#D5D5D5] bg-white text-black hover:border-black"
                          }`}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </article>
                ))}
                {!orders.length && (
                  <div className="rounded-2xl border border-[#D5D5D5] bg-[#f6f6f6] p-8 text-center text-sm font-bold text-[#656565]">
                    Không có đơn hàng phù hợp bộ lọc.
                  </div>
                )}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-extrabold text-black">Theo Trạng Thái</h2>
              <div className="space-y-2">
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <div key={status} className="flex items-center justify-between rounded-xl bg-[#f6f6f6] px-3 py-2">
                    <span className="text-xs font-extrabold text-[#656565]">{label}</span>
                    <span className="text-sm font-black text-black">{dashboard?.statusCounts?.[status] || 0}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-extrabold text-black">Sản Phẩm Sắp Hết</h2>
              <div className="space-y-3">
                {(dashboard?.lowStockProducts || []).map((product) => (
                  <div key={product._id} className="grid grid-cols-[50px_1fr_auto] gap-3 rounded-2xl bg-[#f6f6f6] p-2">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/120x90?text=No+Image"}
                      alt={product.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-sm font-extrabold text-black">{product.name}</div>
                      <div className="text-xs font-bold text-[#656565]">{product.brand}</div>
                    </div>
                    <div className="text-right text-sm font-black text-black">{product.stock}</div>
                  </div>
                ))}
                {!dashboard?.lowStockProducts?.length && (
                  <div className="rounded-2xl bg-[#f6f6f6] p-4 text-sm font-bold text-[#656565]">
                    Chưa có sản phẩm sắp hết hàng.
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>

        <Modal
          open={Boolean(statusTarget)}
          title="Cập nhật trạng thái đơn hàng"
          okText="Cập nhật"
          cancelText="Đóng"
          confirmLoading={updatingStatus}
          okButtonProps={{ danger: statusTarget?.action?.danger }}
          onOk={submitStatus}
          onCancel={() => setStatusTarget(null)}
          destroyOnHidden
        >
          {statusTarget && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#D5D5D5] bg-[#f6f6f6] p-4">
                <div className="text-sm font-extrabold text-black">#{statusTarget.order.orderCode}</div>
                <div className="mt-1 text-sm font-bold text-[#656565]">
                  {statusTarget.order.statusLabel} → {STATUS_LABELS[statusTarget.action.status]}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-extrabold uppercase text-[#656565]">Ghi chú xử lý</div>
                <Input.TextArea
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  rows={4}
                  placeholder="Nhập ghi chú cho dòng trạng thái"
                  maxLength={240}
                  showCount
                />
              </div>
              {statusTarget.action.status === "CANCELLED" && statusTarget.order.paymentMethod === "MOMO" && ["PAID", "REFUND_PENDING"].includes(statusTarget.order.paymentStatus) && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm font-bold text-orange-700">
                  Khi cập nhật hủy, API sẽ gọi MoMo sandbox để hoàn tiền trước. Nếu MoMo từ chối hoàn tiền, đơn sẽ chưa được chuyển sang đã hủy.
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
