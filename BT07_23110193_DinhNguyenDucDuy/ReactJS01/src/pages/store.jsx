import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { FiAward, FiClock, FiGift, FiHeart, FiStar } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import ProductCard from "../components/shop/ProductCard.jsx";
import { getMyStoreApi, getPromotionsApi } from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const StorePage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [store, setStore] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    Promise.all([getMyStoreApi(), getPromotionsApi()])
      .then(([storeRes, promoRes]) => {
        if (storeRes?.EC === 0) setStore(storeRes.DT);
        if (promoRes?.EC === 0) setPromotions(promoRes.DT || []);
      })
      .catch((error) => message.error(error?.EM || "Không thể tải kho thành viên"))
      .finally(() => setLoading(false));
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) return null;
  if (loading || !store) return <div className="min-h-screen p-10 text-center font-bold">Đang tải kho thành viên...</div>;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-black">Kho Thành Viên</h1>
          <p className="mt-1 text-sm font-bold text-[#656565]">Điểm tích lũy, mã giảm giá và sản phẩm bạn quan tâm</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-3xl bg-black p-6 text-[#C0FF6B] shadow-xl">
            <FiStar size={24} />
            <div className="mt-5 text-xs font-extrabold uppercase tracking-widest">Kho điểm tích lũy</div>
            <div className="mt-1 text-4xl font-black">{store.profile.loyaltyPoints.toLocaleString("vi-VN")}</div>
            <div className="mt-1 text-sm font-bold text-white/70">Tương đương {fmt(store.profile.pointsValue)}</div>
          </section>
          <section className="rounded-3xl border border-[#D5D5D5] bg-white p-6 shadow-sm">
            <FiAward size={24} />
            <div className="mt-5 text-xs font-extrabold uppercase tracking-widest text-[#656565]">Hạng thành viên</div>
            <div className="mt-1 text-3xl font-black text-black">{store.profile.membershipTier}</div>
            <div className="mt-1 text-sm font-bold text-[#656565]">Đã mua {fmt(store.profile.totalSpent)}</div>
          </section>
          <section className="rounded-3xl border border-[#D5D5D5] bg-[#C0FF6B]/30 p-6 shadow-sm">
            <FiGift size={24} />
            <div className="mt-5 text-xs font-extrabold uppercase tracking-widest text-[#656565]">Voucher cá nhân</div>
            <div className="mt-1 text-3xl font-black text-black">{store.vouchers.length}</div>
            <div className="mt-1 text-sm font-bold text-[#656565]">Dùng trực tiếp khi thanh toán</div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-black text-black"><FiGift /> Mã Giảm Giá & Khuyến Mãi</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {promotions.map((voucher) => (
              <article key={voucher._id} className="rounded-2xl border border-dashed border-black bg-[#f8fff0] p-4">
                <div className="text-lg font-black text-black">{voucher.code}</div>
                <div className="text-sm font-extrabold text-[#656565]">{voucher.title}</div>
                <div className="mt-2 text-sm font-black text-black">{voucher.discountLabel}</div>
                <div className="mt-1 text-xs font-bold text-[#656565]">Đơn tối thiểu {fmt(voucher.minOrder)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-black"><FiHeart /> Sản Phẩm Yêu Thích</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {store.favorites.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
          {!store.favorites.length && <div className="rounded-2xl bg-white p-5 text-sm font-bold text-[#656565]">Chưa có sản phẩm yêu thích.</div>}
        </section>

        <section className="mt-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-black text-black"><FiClock /> Sản Phẩm Đã Xem</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {store.recentlyViewed.slice(0, 4).map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </section>
      </div>
    </div>
  );
};

export default StorePage;
