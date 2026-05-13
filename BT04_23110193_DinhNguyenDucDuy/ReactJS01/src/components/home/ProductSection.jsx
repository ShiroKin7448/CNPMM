import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "../shop/ProductCard.jsx";

const SECTION_CONFIGS = {
  sale:       { emoji: "🔥", label: "Đang Giảm Giá", color: "from-red-500 to-orange-400",   bg: "bg-red-50",   text: "text-red-600"   },
  newest:     { emoji: "✨", label: "Hàng Mới Về",    color: "from-emerald-500 to-teal-400", bg: "bg-emerald-50", text: "text-emerald-600" },
  bestSeller: { emoji: "🏆", label: "Bán Chạy Nhất", color: "from-amber-500 to-yellow-400", bg: "bg-amber-50",  text: "text-amber-600"  },
  featured:   { emoji: "⭐", label: "Nổi Bật",       color: "from-indigo-600 to-purple-500", bg: "bg-indigo-50", text: "text-indigo-600" },
};

const ProductSection = ({ type, products = [] }) => {
  const navigate = useNavigate();
  const cfg = SECTION_CONFIGS[type] ?? SECTION_CONFIGS.featured;

  if (!products.length) return null;

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${cfg.color}`} />
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              {cfg.emoji} {cfg.label}
            </h2>
            <p className="text-xs text-slate-400">{products.length} sản phẩm</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/shop?tag=${type === "bestSeller" ? "best-seller" : type}`)}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          Xem tất cả <FiArrowRight size={14} />
        </button>
      </div>

      {/* Swiper row */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
        className="!pb-2"
      >
        {products.map(p => (
          <SwiperSlide key={p._id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default ProductSection;
