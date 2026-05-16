import ProductCard from "./ProductCard.jsx";
import { FiPackage, FiRefreshCw, FiZap } from "react-icons/fi";

const ProductGrid = ({ products, loading, onReset }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-[22px] border border-[#D5D5D5] bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-extrabold text-black">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C0FF6B]">
              <FiZap size={15} />
            </span>
            Đang tải sản phẩm phù hợp
          </div>
          <div className="hidden h-2 w-28 rounded-full bg-[#D5D5D5] sm:block" />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-[24px] border border-[#D5D5D5] bg-white shadow-sm"
            >
              <div
                className="aspect-[4/3] animate-pulse"
                style={{
                  background:
                    "linear-gradient(110deg,#eeeeee 8%,#D5D5D5 18%,#eeeeee 33%)",
                  backgroundSize: "200% 100%",
                }}
              />
              <div className="space-y-3 p-4">
                <div className="h-3 w-24 animate-pulse rounded-full bg-[#C0FF6B]/70" />
                <div className="h-4 w-full animate-pulse rounded bg-[#D5D5D5]" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-[#D5D5D5]" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-28 animate-pulse rounded bg-[#656565]/25" />
                  <div className="h-9 w-9 animate-pulse rounded-full bg-black/15" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="overflow-hidden rounded-[28px] border border-[#D5D5D5] bg-white shadow-xl shadow-black/10">
        <div
          className="flex flex-col items-center justify-center px-6 py-20 text-center"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(192,255,107,0.45), transparent 34%), linear-gradient(180deg,#ffffff 0%,#f2f2f2 100%)",
          }}
        >
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-black text-[#C0FF6B] shadow-2xl shadow-black/25">
            <FiPackage size={34} />
          </div>
          <h3 className="text-2xl font-extrabold text-black">Không có sản phẩm phù hợp</h3>
          <p className="mt-2 max-w-md text-sm font-medium text-[#656565]">
            Thử nới khoảng giá, bỏ bớt thương hiệu hoặc tìm bằng từ khóa ngắn hơn.
          </p>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B] shadow-lg shadow-black/20 transition hover:-translate-y-0.5"
            >
              <FiRefreshCw size={15} />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {products.map((p, i) => (
        <div key={p._id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
