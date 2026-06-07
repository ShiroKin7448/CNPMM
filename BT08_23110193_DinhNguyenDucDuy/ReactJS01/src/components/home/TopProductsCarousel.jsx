import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiEye, FiTrendingUp } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProductCard from "../shop/ProductCard.jsx";

const CONFIG = {
  "best-selling": {
    title: "Top 10 sản phẩm bán chạy nhất",
    subtitle: "Xếp hạng theo số lượng đã bán",
    icon: <FiTrendingUp size={18} />,
    metricLabel: "Đã bán",
    metricKey: "sold",
    query: "sort=best-selling",
  },
  "most-viewed": {
    title: "Top 10 sản phẩm xem nhiều nhất",
    subtitle: "Xếp hạng theo lượt mở chi tiết sản phẩm",
    icon: <FiEye size={18} />,
    metricLabel: "Lượt xem",
    metricKey: "viewCount",
    query: "sort=most-viewed",
  },
};

const TopProductsCarousel = ({ type = "best-selling", products = [] }) => {
  const navigate = useNavigate();
  const cfg = CONFIG[type] || CONFIG["best-selling"];

  if (!products.length) return null;

  return (
    <section className="mb-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-[#C0FF6B] shadow-lg shadow-black/15">
            {cfg.icon}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-extrabold text-slate-800">{cfg.title}</h2>
            <p className="text-xs font-semibold text-slate-400">{cfg.subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/shop?${cfg.query}`)}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-800"
        >
          Xem tất cả <FiArrowRight size={14} />
        </button>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={16}
        slidesPerView={1.35}
        breakpoints={{
          520: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="top-products-swiper product-row-swiper !pb-10"
      >
        {products.slice(0, 10).map((product, index) => (
          <SwiperSlide key={product._id}>
            <div className="relative h-full">
              <div className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black px-3 py-1.5 text-xs font-extrabold text-[#C0FF6B] shadow-lg shadow-black/25">
                #{index + 1}
              </div>
              <div className="absolute right-3 top-14 z-10 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-black shadow-lg shadow-black/15">
                {cfg.metricLabel}: {(product[cfg.metricKey] || 0).toLocaleString("vi-VN")}
              </div>
              <ProductCard product={product} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default TopProductsCarousel;
