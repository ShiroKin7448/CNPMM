import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import { FiCheckCircle, FiCreditCard, FiGift, FiMapPin, FiSmartphone, FiStar, FiTruck } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import { checkoutApi, getCartApi, getMyStoreApi, getPromotionsApi } from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const PAYMENT_OPTIONS = [
  {
    key: "COD",
    title: "Thanh toán khi nhận hàng (COD)",
    desc: "Thanh toán tiền mặt sau khi đơn được giao thành công",
    icon: <FiTruck size={20} />,
  },
  {
    key: "MOMO",
    title: "Ví MoMo",
    desc: "Thanh toán qua cổng MoMo sandbox",
    icon: <FiSmartphone size={20} />,
  },
];

const readCheckoutSelection = (location) => {
  if (Array.isArray(location.state?.selectedProductIds)) return location.state.selectedProductIds;

  try {
    const raw = localStorage.getItem("checkout_product_ids");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [loyalty, setLoyalty] = useState({ profile: { loyaltyPoints: 0 }, pointValue: 1000 });
  const [voucherCode, setVoucherCode] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [form, setForm] = useState({
    fullName: auth.user.name || "",
    phone: "",
    address: "",
    note: "",
    paymentMethod: "COD",
  });

  const selectedItems = useMemo(
    () => cart.items.filter((item) => selectedProductIds.includes(item.product._id)),
    [cart.items, selectedProductIds]
  );
  const subtotal = selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const shippingFee = useMemo(() => (subtotal >= 20000000 ? 0 : 30000), [subtotal]);
  const selectedVoucher = promotions.find((voucher) => voucher.code === voucherCode);
  const rawVoucherDiscount = selectedVoucher
    ? selectedVoucher.discountType === "PERCENT"
      ? Math.floor(subtotal * selectedVoucher.value / 100)
      : selectedVoucher.value
    : 0;
  const voucherDiscount = Math.min(rawVoucherDiscount, selectedVoucher?.maxDiscount || rawVoucherDiscount, subtotal);
  const maxPoints = Math.min(
    loyalty.profile?.loyaltyPoints || 0,
    Math.floor(Math.max(0, subtotal + shippingFee - voucherDiscount) / (loyalty.pointValue || 1000))
  );
  const validPointsToUse = Math.min(pointsToUse, maxPoints);
  const pointsDiscount = validPointsToUse * (loyalty.pointValue || 1000);
  const total = Math.max(0, subtotal + shippingFee - voucherDiscount - pointsDiscount);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }

    const loadCart = async () => {
      setLoading(true);
      try {
        const selectedIds = readCheckoutSelection(location);
        if (!selectedIds.length) {
          message.warning("Vui lòng chọn sản phẩm cần thanh toán trong giỏ hàng");
          navigate("/cart");
          return;
        }

        const [res, promotionsRes, loyaltyRes] = await Promise.all([
          getCartApi(),
          getPromotionsApi(),
          getMyStoreApi(),
        ]);
        if (promotionsRes?.EC === 0) setPromotions(promotionsRes.DT || []);
        if (loyaltyRes?.EC === 0) setLoyalty(loyaltyRes.DT);
        if (res?.EC === 0) {
          const availableIds = res.DT.items.map((item) => item.product._id);
          const validSelectedIds = selectedIds.filter((id) => availableIds.includes(id));
          if (!validSelectedIds.length) {
            message.warning("Các sản phẩm đã chọn không còn trong giỏ hàng");
            navigate("/cart");
            return;
          }
          setCart(res.DT);
          setSelectedProductIds(validSelectedIds);
        }
      } catch (error) {
        message.error(error?.EM || "Không thể tải giỏ hàng");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [auth.isAuthenticated]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!selectedProductIds.length) {
      message.warning("Vui lòng chọn sản phẩm cần thanh toán");
      navigate("/cart");
      return;
    }

    setSubmitting(true);
    try {
      const res = await checkoutApi({
        paymentMethod: form.paymentMethod,
        selectedProductIds,
        voucherCode,
        pointsToUse: validPointsToUse,
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          note: form.note,
        },
      });

      if (res?.EC === 0) {
        localStorage.removeItem("checkout_product_ids");
        window.dispatchEvent(new Event("cart-updated"));
        if (form.paymentMethod === "MOMO" && res.DT?.paymentInfo?.payUrl) {
          message.success("Đang chuyển sang MoMo sandbox");
          window.location.href = res.DT.paymentInfo.payUrl;
          return;
        }
        message.success(res.EM || "Đặt hàng thành công");
        navigate(`/orders/${res.DT._id}`);
      } else {
        message.error(res?.EM || "Không thể đặt hàng");
      }
    } catch (error) {
      message.error(error?.EM || "Không thể đặt hàng");
    } finally {
      setSubmitting(false);
    }
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-black">Thanh Toán</h1>
          <p className="mt-1 text-sm font-semibold text-[#656565]">Thanh toán {selectedQuantity} sản phẩm đã chọn trong giỏ hàng</p>
        </div>

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-96 animate-pulse rounded-3xl bg-white/80" />
            <div className="h-80 animate-pulse rounded-3xl bg-white/80" />
          </div>
        ) : (
          <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
                    <FiMapPin size={20} />
                  </div>
                  <h2 className="text-lg font-extrabold text-black">Thông Tin Giao Hàng</h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase text-[#656565]">Người nhận</span>
                    <input
                      required
                      value={form.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      className="w-full rounded-2xl border border-[#D5D5D5] px-4 py-3 text-sm font-semibold outline-none focus:border-black"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase text-[#656565]">Số điện thoại</span>
                    <input
                      required
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="w-full rounded-2xl border border-[#D5D5D5] px-4 py-3 text-sm font-semibold outline-none focus:border-black"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase text-[#656565]">Địa chỉ</span>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      className="w-full rounded-2xl border border-[#D5D5D5] px-4 py-3 text-sm font-semibold outline-none focus:border-black"
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-extrabold uppercase text-[#656565]">Ghi chú</span>
                    <textarea
                      value={form.note}
                      onChange={(e) => updateField("note", e.target.value)}
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-[#D5D5D5] px-4 py-3 text-sm font-semibold outline-none focus:border-black"
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
                    <FiCreditCard size={20} />
                  </div>
                  <h2 className="text-lg font-extrabold text-black">Phương Thức Thanh Toán</h2>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_OPTIONS.map((option) => {
                    const active = form.paymentMethod === option.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        onClick={() => updateField("paymentMethod", option.key)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          active ? "border-2 border-black bg-[#C0FF6B]/20" : "border-[#D5D5D5] bg-white hover:border-black"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-black">{active ? <FiCheckCircle size={22} /> : option.icon}</div>
                          <div>
                            <div className="font-extrabold text-black">{option.title}</div>
                            <div className="text-xs font-bold text-[#656565]">{option.desc}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {form.paymentMethod === "MOMO" && (
                  <div className="mt-4 rounded-2xl border border-pink-100 bg-pink-50 p-4 text-sm font-bold text-pink-700">
                    Sau khi bấm thanh toán, hệ thống sẽ tạo giao dịch trên MoMo sandbox và chuyển bạn sang trang thanh toán của MoMo.
                  </div>
                )}
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
                    <FiGift size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-black">Mã Giảm Giá & Kho Điểm</h2>
                    <p className="text-xs font-bold text-[#656565]">Dùng ưu đãi cho lần mua hiện tại</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {promotions.map((voucher) => (
                    <button
                      key={voucher._id}
                      type="button"
                      onClick={() => setVoucherCode((current) => current === voucher.code ? "" : voucher.code)}
                      className={`rounded-2xl border border-dashed p-4 text-left transition ${voucherCode === voucher.code ? "border-2 border-black bg-[#C0FF6B]/25" : "border-[#D5D5D5] hover:border-black"}`}
                    >
                      <div className="font-black text-black">{voucher.code}</div>
                      <div className="mt-1 text-sm font-bold text-[#656565]">{voucher.discountLabel}</div>
                      <div className="mt-1 text-xs font-bold text-[#656565]">Tối thiểu {fmt(voucher.minOrder)}</div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl bg-[#f6f6f6] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black text-black"><FiStar /> Kho điểm: {(loyalty.profile?.loyaltyPoints || 0).toLocaleString("vi-VN")}</div>
                    <span className="text-xs font-bold text-[#656565]">1 điểm = {fmt(loyalty.pointValue || 1000)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={maxPoints}
                    value={validPointsToUse}
                    onChange={(event) => setPointsToUse(Number(event.target.value))}
                    className="mt-3 w-full accent-black"
                  />
                  <div className="mt-1 text-xs font-bold text-[#656565]">Dùng {validPointsToUse} điểm, giảm {fmt(pointsDiscount)}</div>
                </div>
              </section>
            </div>

            <aside className="h-fit rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black text-[#C0FF6B]">
                  <FiTruck size={20} />
                </div>
                <h2 className="text-lg font-extrabold text-black">Đơn Hàng</h2>
              </div>

              <div className="max-h-[340px] space-y-3 overflow-auto pr-1">
                {selectedItems.map((item) => (
                  <div key={item.product._id} className="grid grid-cols-[56px_1fr] gap-3">
                    <img
                      src={item.product.images?.[0] || "https://via.placeholder.com/160x120?text=No+Image"}
                      alt={item.product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <div className="line-clamp-2 text-sm font-extrabold text-black">{item.product.name}</div>
                      <div className="mt-1 flex justify-between gap-2 text-xs font-bold text-[#656565]">
                        <span>x{item.quantity}</span>
                        <span>{fmt(item.lineTotal)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-3 border-t border-[#D5D5D5] pt-5 text-sm font-bold">
                <div className="flex justify-between text-[#656565]">
                  <span>Tiền hàng</span>
                  <span>{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#656565]">
                  <span>Phí giao hàng</span>
                  <span>{shippingFee === 0 ? "Miễn phí" : fmt(shippingFee)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Mã {voucherCode}</span>
                    <span>-{fmt(voucherDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Đổi {validPointsToUse} điểm</span>
                    <span>-{fmt(pointsDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-black text-black">
                  <span>Tổng thanh toán</span>
                  <span>{fmt(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedItems.length}
                className="mt-6 w-full rounded-2xl bg-black px-5 py-3.5 text-sm font-extrabold text-[#C0FF6B] transition hover:bg-[#C0FF6B] hover:text-black disabled:opacity-60"
              >
                {submitting ? "Đang xử lý..." : form.paymentMethod === "COD" ? "Đặt hàng COD" : "Thanh toán MoMo"}
              </button>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
