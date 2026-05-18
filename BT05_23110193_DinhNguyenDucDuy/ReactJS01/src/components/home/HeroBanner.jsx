import { useNavigate } from "react-router-dom";
import { FiShoppingBag, FiArrowRight, FiZap } from "react-icons/fi";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1771015310937-6754da25e49a?auto=format&fit=crop&w=1800&q=85";

const HeroBanner = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div
      className="relative overflow-hidden rounded-3xl mb-10 p-8 md:p-12 text-white shadow-xl"
      style={{
        backgroundImage:
          `linear-gradient(100deg, rgba(0,0,0,0.92) 0%, rgba(101,101,101,0.72) 48%, rgba(192,255,107,0.36) 100%), url(${HERO_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxShadow: "0 22px 60px rgba(0,0,0,0.22)",
      }}
    >

      <div className="relative z-10 max-w-2xl">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-1.5 text-sm font-medium mb-5">
          <FiZap size={14} style={{ color: "#C0FF6B" }} />
          <span>Chào mừng, {user?.name || "bạn"}! 👋</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
          Laptop & Phụ Kiện
          <br />
          <span style={{ color: "#C0FF6B" }}>Chính Hãng Giá Tốt</span>
        </h1>

        <p className="text-white/80 text-base md:text-lg mb-8 max-w-lg leading-relaxed">
          Khám phá hàng ngàn sản phẩm laptop, phụ kiện gaming chính hãng. 
          Cam kết bảo hành toàn quốc, giao hàng nhanh 2H.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/shop")}
            className="bg-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            style={{ color: "#000000" }}
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
              <div className="text-xl font-extrabold" style={{ color: "#C0FF6B" }}>{num}</div>
              <div className="text-xs text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
