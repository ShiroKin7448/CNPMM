import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Checkbox, message, Modal } from "antd";
import {
  FiArrowRight, FiMinus, FiPlus, FiShoppingCart,
  FiTrash2, FiXCircle,
} from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import {
  clearCartApi,
  getCartApi,
  removeCartItemApi,
  updateCartItemApi,
} from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const CartPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");

  const syncSelectedIds = (nextCart, selectAll = false) => {
    const availableIds = (nextCart.items || [])
      .filter((item) => item.inStock)
      .map((item) => item.product._id);

    setSelectedIds((prev) => {
      if (selectAll || prev.length === 0) return availableIds;
      return prev.filter((id) => availableIds.includes(id));
    });
  };

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await getCartApi();
      if (res?.EC === 0) {
        setCart(res.DT);
        syncSelectedIds(res.DT, true);
      }
    } catch (error) {
      message.error(error?.EM || "Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    loadCart();
  }, [auth.isAuthenticated]);

  const refreshCart = (nextCart) => {
    setCart(nextCart);
    syncSelectedIds(nextCart);
    window.dispatchEvent(new Event("cart-updated"));
  };

  const selectedItems = useMemo(
    () => cart.items.filter((item) => selectedIds.includes(item.product._id)),
    [cart.items, selectedIds]
  );
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const selectedQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const selectableIds = cart.items.filter((item) => item.inStock).map((item) => item.product._id);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = (checked) => {
    setSelectedIds(checked ? selectableIds : []);
  };

  const toggleItem = (productId, checked) => {
    setSelectedIds((prev) => checked
      ? Array.from(new Set([...prev, productId]))
      : prev.filter((id) => id !== productId)
    );
  };

  const updateQuantity = async (productId, quantity) => {
    setUpdating(productId);
    try {
      const res = await updateCartItemApi(productId, quantity);
      if (res?.EC === 0) refreshCart(res.DT);
      else message.error(res?.EM || "Không thể cập nhật giỏ hàng");
    } catch (error) {
      message.error(error?.EM || "Không thể cập nhật giỏ hàng");
    } finally {
      setUpdating("");
    }
  };

  const removeItem = async (productId) => {
    setUpdating(productId);
    try {
      const res = await removeCartItemApi(productId);
      if (res?.EC === 0) {
        refreshCart(res.DT);
        message.success("Đã xóa sản phẩm khỏi giỏ hàng");
      }
    } catch (error) {
      message.error(error?.EM || "Không thể xóa sản phẩm");
    } finally {
      setUpdating("");
    }
  };

  const clearCart = () => {
    Modal.confirm({
      title: "Xóa toàn bộ giỏ hàng?",
      okText: "Xóa",
      cancelText: "Giữ lại",
      okButtonProps: { danger: true },
      onOk: async () => {
        const res = await clearCartApi();
        if (res?.EC === 0) {
          refreshCart(res.DT);
          setSelectedIds([]);
          message.success("Đã xóa giỏ hàng");
        }
      },
    });
  };

  const goToCheckout = () => {
    if (!selectedIds.length) {
      message.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }
    localStorage.setItem("checkout_product_ids", JSON.stringify(selectedIds));
    navigate("/checkout", { state: { selectedProductIds: selectedIds } });
  };

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-black">Giỏ Hàng</h1>
            <p className="mt-1 text-sm font-semibold text-[#656565]">
              {cart.totalItems || 0} sản phẩm trong giỏ, đã chọn {selectedQuantity}
            </p>
          </div>
          {cart.items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center gap-2 rounded-xl border border-[#D5D5D5] bg-white px-4 py-2 text-sm font-extrabold text-black transition hover:border-black"
            >
              <FiTrash2 size={15} /> Xóa giỏ hàng
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-white/80" />
              ))}
            </div>
            <div className="h-56 animate-pulse rounded-2xl bg-white/80" />
          </div>
        ) : cart.items.length === 0 ? (
          <div className="rounded-3xl border border-[#D5D5D5] bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-[#C0FF6B]">
              <FiShoppingCart size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-black">Giỏ hàng đang trống</h2>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-extrabold text-[#C0FF6B] no-underline transition hover:bg-[#C0FF6B] hover:text-black"
            >
              Tiếp tục mua hàng <FiArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-[#D5D5D5] bg-white px-4 py-3 shadow-sm">
                <Checkbox checked={allSelected} indeterminate={selectedIds.length > 0 && !allSelected} onChange={(e) => toggleSelectAll(e.target.checked)}>
                  <span className="text-sm font-extrabold text-black">Chọn tất cả sản phẩm còn hàng</span>
                </Checkbox>
                <span className="text-xs font-bold text-[#656565]">{selectedItems.length}/{cart.items.length} dòng sản phẩm</span>
              </div>

              {cart.items.map((item) => {
                const product = item.product;
                const checked = selectedIds.includes(product._id);
                return (
                  <div
                    key={product._id}
                    className={`grid gap-4 rounded-3xl border bg-white p-4 shadow-sm sm:grid-cols-[32px_120px_1fr_auto] ${
                      checked ? "border-black" : "border-[#D5D5D5]"
                    }`}
                  >
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={checked}
                        disabled={!item.inStock}
                        onChange={(e) => toggleItem(product._id, e.target.checked)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#D5D5D5]"
                    >
                      <img
                        src={product.images?.[0] || "https://via.placeholder.com/320x240?text=No+Image"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </button>

                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => navigate(`/product/${product._id}`)}
                        className="line-clamp-2 text-left text-base font-extrabold text-black hover:underline"
                      >
                        {product.name}
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold text-[#656565]">
                        <span>{product.brand}</span>
                        <span className="h-1 w-1 rounded-full bg-[#D5D5D5]" />
                        <span>Còn {product.stock}</span>
                        {!item.inStock && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-red-600">
                            <FiXCircle size={12} /> Vượt tồn kho
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <div className="inline-grid grid-cols-[36px_48px_36px] overflow-hidden rounded-full border border-[#D5D5D5] bg-white">
                          <button
                            type="button"
                            disabled={updating === product._id}
                            onClick={() => updateQuantity(product._id, item.quantity - 1)}
                            className="grid h-9 place-items-center text-black hover:bg-[#f3f3f3]"
                          >
                            <FiMinus size={14} />
                          </button>
                          <div className="grid h-9 place-items-center border-x border-[#D5D5D5] text-sm font-extrabold">
                            {item.quantity}
                          </div>
                          <button
                            type="button"
                            disabled={updating === product._id || item.quantity >= product.stock}
                            onClick={() => updateQuantity(product._id, item.quantity + 1)}
                            className="grid h-9 place-items-center text-black hover:bg-[#f3f3f3] disabled:opacity-40"
                          >
                            <FiPlus size={14} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(product._id)}
                          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#D5D5D5] px-3 text-xs font-extrabold text-black hover:border-black"
                        >
                          <FiTrash2 size={13} /> Xóa
                        </button>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-sm font-bold text-[#656565]">{fmt(item.unitPrice)}</div>
                      <div className="mt-1 text-lg font-black text-black">{fmt(item.lineTotal)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <h2 className="text-lg font-extrabold text-black">Sản Phẩm Đã Chọn</h2>
              <div className="mt-5 space-y-3 border-b border-[#D5D5D5] pb-5 text-sm font-bold">
                <div className="flex justify-between text-[#656565]">
                  <span>Dòng sản phẩm</span>
                  <span>{selectedItems.length}</span>
                </div>
                <div className="flex justify-between text-[#656565]">
                  <span>Số lượng</span>
                  <span>{selectedQuantity}</span>
                </div>
                <div className="flex justify-between text-[#656565]">
                  <span>Tiền hàng</span>
                  <span>{fmt(selectedSubtotal)}</span>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-sm font-extrabold text-black">Tạm tính</span>
                <span className="text-xl font-black text-black">{fmt(selectedSubtotal)}</span>
              </div>
              <button
                type="button"
                disabled={!selectedIds.length || selectedItems.some((item) => !item.inStock)}
                onClick={goToCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3.5 text-sm font-extrabold text-[#C0FF6B] transition hover:bg-[#C0FF6B] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Thanh toán sản phẩm đã chọn <FiArrowRight size={16} />
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
