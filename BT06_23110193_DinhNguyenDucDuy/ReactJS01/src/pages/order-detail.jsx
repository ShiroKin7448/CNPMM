import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { FiArrowLeft, FiCheck, FiClock, FiCreditCard, FiExternalLink, FiPackage, FiRefreshCw, FiTruck, FiXCircle } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import CancelOrderModal from "../components/order/CancelOrderModal.jsx";
import { getOrderDetailApi, syncMomoPaymentApi } from "../util/api.js";

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

const STEPS = [
  { key: "NEW", label: "Đơn hàng mới", icon: <FiPackage /> },
  { key: "CONFIRMED", label: "Đã xác nhận", icon: <FiCheck /> },
  { key: "PREPARING", label: "Chuẩn bị hàng", icon: <FiPackage /> },
  { key: "SHIPPING", label: "Đang giao", icon: <FiTruck /> },
  { key: "DELIVERED", label: "Đã giao", icon: <FiCheck /> },
];

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncingPayment, setSyncingPayment] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const activeStep = useMemo(() => {
    if (!order || order.status === "CANCELLED") return -1;
    if (order.status === "CANCEL_REQUESTED") {
      const previousIndex = STEPS.findIndex((step) => step.key === order.cancelRequestFromStatus);
      return previousIndex >= 0 ? previousIndex : 2;
    }
    return STEPS.findIndex((step) => step.key === order.status);
  }, [order]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await getOrderDetailApi(id);
      if (res?.EC === 0) setOrder(res.DT);
      else message.error(res?.EM || "Không tìm thấy đơn hàng");
    } catch (error) {
      message.error(error?.EM || "Không tìm thấy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrder();
  }, [auth.isAuthenticated, id]);

  const syncMomoPayment = async () => {
    setSyncingPayment(true);
    try {
      const res = await syncMomoPaymentApi(order._id);
      if (res?.EC === 0) {
        setOrder(res.DT);
        message.success(res.EM || "Đã kiểm tra thanh toán MoMo");
      } else {
        message.error(res?.EM || "Không kiểm tra được MoMo");
      }
    } catch (error) {
      message.error(error?.EM || "Không kiểm tra được MoMo");
    } finally {
      setSyncingPayment(false);
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate("/orders")}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#D5D5D5] bg-white px-4 py-2 text-sm font-extrabold text-black hover:border-black"
        >
          <FiArrowLeft size={15} /> Đơn hàng
        </button>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="h-96 animate-pulse rounded-3xl bg-white/80" />
            <div className="h-80 animate-pulse rounded-3xl bg-white/80" />
          </div>
        ) : !order ? (
          <div className="rounded-3xl border border-[#D5D5D5] bg-white p-10 text-center shadow-sm">
            <h1 className="text-xl font-extrabold text-black">Không tìm thấy đơn hàng</h1>
            <Link to="/orders" className="mt-5 inline-flex rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B] no-underline">
              Quay lại
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-black text-black">#{order.orderCode}</h1>
                    <div className="mt-2 flex items-center gap-2 text-sm font-bold text-[#656565]">
                      <FiClock size={15} /> {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div className="rounded-full border border-[#D5D5D5] bg-[#f6f6f6] px-4 py-2 text-sm font-extrabold text-black">
                    {order.statusLabel}
                  </div>
                </div>

                {order.status === "CANCELLED" ? (
                  <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700">
                    Đơn hàng đã hủy. {order.cancelReason}
                  </div>
                ) : (
                  <div className="mt-7 grid gap-3 md:grid-cols-5">
                    {STEPS.map((step, index) => {
                      const done = index <= activeStep;
                      return (
                        <div key={step.key}>
                          <div className={`flex h-full flex-col items-center rounded-2xl border p-3 text-center ${done ? "border-black bg-[#C0FF6B]/25 text-black" : "border-[#D5D5D5] bg-white text-[#656565]"}`}>
                            <div className={`mb-2 grid h-10 w-10 place-items-center rounded-full ${done ? "bg-black text-[#C0FF6B]" : "bg-[#f3f3f3] text-[#656565]"}`}>
                              {step.icon}
                            </div>
                            <div className="text-xs font-extrabold">{step.label}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {order.status === "CANCEL_REQUESTED" && (
                  <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 p-4 text-sm font-bold text-orange-700">
                    Yêu cầu hủy đã gửi tới shop và đang chờ admin duyệt.
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-extrabold text-black">Sản Phẩm</h2>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={`${order._id}-${item.product}`} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-2xl border border-[#D5D5D5] p-3">
                      <img src={item.image || "https://via.placeholder.com/160x120?text=No+Image"} alt={item.name} className="h-[72px] w-[72px] rounded-xl object-cover" />
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-extrabold text-black">{item.name}</div>
                        <div className="mt-1 text-xs font-bold text-[#656565]">{fmt(item.price)} · x{item.quantity}</div>
                      </div>
                      <div className="text-right text-sm font-black text-black">{fmt(item.total)}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-lg font-extrabold text-black">Dòng Trạng Thái</h2>
                <div className="space-y-3">
                  {[...(order.timeline || [])].reverse().map((entry, index) => (
                    <div key={`${entry.status}-${entry.at}-${index}`} className="flex gap-3">
                      <div className="mt-1 h-3 w-3 rounded-full bg-black ring-4 ring-[#C0FF6B]/40" />
                      <div>
                        <div className="text-sm font-extrabold text-black">{entry.label}</div>
                        <div className="text-xs font-bold text-[#656565]">{formatDate(entry.at)}</div>
                        {entry.note && <div className="mt-1 text-sm text-[#656565]">{entry.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
                  <FiCreditCard size={20} />
                </div>
                <h2 className="text-lg font-extrabold text-black">Thanh Toán</h2>
              </div>

              <div className="space-y-3 border-b border-[#D5D5D5] pb-5 text-sm font-bold text-[#656565]">
                <div className="flex justify-between">
                  <span>Phương thức</span>
                  <span className="text-black">{order.paymentMethodLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái</span>
                  <span className="text-black">{order.paymentStatusLabel}</span>
                </div>
                {order.paymentInfo?.transId && (
                  <div className="flex justify-between gap-3">
                    <span>Mã MoMo</span>
                    <span className="truncate text-black">{order.paymentInfo.transId}</span>
                  </div>
                )}
                {order.paymentInfo?.refundTransId && (
                  <div className="flex justify-between gap-3">
                    <span>Mã hoàn tiền</span>
                    <span className="truncate text-black">{order.paymentInfo.refundTransId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tiền hàng</span>
                  <span>{fmt(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí giao hàng</span>
                  <span>{order.shippingFee === 0 ? "Miễn phí" : fmt(order.shippingFee)}</span>
                </div>
              </div>
              <div className="mt-5 flex justify-between text-lg font-black text-black">
                <span>Tổng</span>
                <span>{fmt(order.total)}</span>
              </div>

              {order.paymentMethod === "MOMO" && order.paymentStatus === "PENDING" && (
                <div className="mt-5 space-y-2">
                  <div className="rounded-2xl border border-pink-100 bg-pink-50 p-3 text-xs font-bold text-pink-700">
                    Hạn thanh toán: {order.momoPaymentExpiresAt ? formatDate(order.momoPaymentExpiresAt) : "15 phút sau khi đặt"}. Nếu quá hạn, đơn sẽ tự hủy và sản phẩm được đưa lại vào giỏ hàng.
                  </div>
                  {order.paymentInfo?.payUrl && (
                    <button
                      type="button"
                      onClick={() => { window.location.href = order.paymentInfo.payUrl; }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B] transition hover:bg-[#C0FF6B] hover:text-black"
                    >
                      <FiExternalLink size={16} />
                      Tiếp tục thanh toán MoMo
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={syncingPayment}
                    onClick={syncMomoPayment}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D5D5D5] px-5 py-3 text-sm font-extrabold text-black transition hover:border-black disabled:opacity-60"
                  >
                    <FiRefreshCw size={16} />
                    {syncingPayment ? "Đang kiểm tra..." : "Kiểm tra thanh toán"}
                  </button>
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-[#f6f6f6] p-4">
                <div className="text-xs font-extrabold uppercase text-[#656565]">Giao đến</div>
                <div className="mt-2 text-sm font-extrabold text-black">{order.shippingAddress.fullName}</div>
                <div className="mt-1 text-sm font-bold text-[#656565]">{order.shippingAddress.phone}</div>
                <div className="mt-1 text-sm font-bold text-[#656565]">{order.shippingAddress.address}</div>
                {order.shippingAddress.note && <div className="mt-2 text-xs font-bold text-[#656565]">{order.shippingAddress.note}</div>}
              </div>

              {order.cancelPolicy?.canCancel && (
                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D5D5D5] px-5 py-3 text-sm font-extrabold text-black transition hover:border-black"
                >
                  <FiXCircle size={16} />
                  {order.cancelPolicy.action === "request" ? "Gửi yêu cầu hủy" : "Hủy trực tiếp"}
                </button>
              )}
            </aside>
          </div>
        )}

        <CancelOrderModal
          order={order}
          open={cancelOpen}
          onClose={() => setCancelOpen(false)}
          onSuccess={(updatedOrder) => setOrder(updatedOrder)}
        />
      </div>
    </div>
  );
};

export default OrderDetailPage;
