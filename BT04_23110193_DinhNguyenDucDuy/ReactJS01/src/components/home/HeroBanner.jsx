import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiArrowRight, FiZap } from "react-icons/fi";
import { HiLightningBolt } from "react-icons/hi";

const HeroBanner = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden rounded-3xl mb-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white shadow-xl shadow-indigo-200">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

      {/* Floating icons */}
      <div className="absolute top-8 right-8 opacity-20 hidden md:block">
        <div className="text-8xl select-none">💻</div>
      </div>

      <div className="relative z-10 max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <FiZap size={14} className="text-yellow-300" />
          <span>Chào mừng, {user?.name || "bạn"}! 👋</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
          Laptop & Phụ Kiện
          <br />
          <span className="text-yellow-300">Chính Hãng Giá Tốt</span>
        </h1>

        <p className="text-white/80 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
          Khám phá hàng ngàn sản phẩm laptop, phụ kiện gaming chính hãng. 
          Cam kết bảo hành toàn quốc, giao hàng nhanh 2H.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/shop")}
            className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-yellow-50 transition-all shadow-lg hover:shadow-xl hover:scale-105"
          >
            <FiShoppingBag size={18} /> Mua Sắm Ngay
          </button>
          <button
            onClick={() => navigate("/shop?tag=sale")}
            className="bg-white/20 backdrop-blur-sm border border-white/40 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/30 transition-all"
          >
            Xem Khuyến Mãi <FiArrowRight size={16} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-8 pt-6 border-t border-white/20">
          {[["500+", "Sản phẩm"], ["10K+", "Khách hàng"], ["4.9★", "Đánh giá"]].map(([num, label]) => (
            <div key={label}>
              <div className="text-xl font-extrabold text-yellow-300">{num}</div>
              <div className="text-xs text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
