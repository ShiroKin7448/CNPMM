import ProductCard from "./ProductCard.jsx";
import { FiPackage } from "react-icons/fi";

const ProductGrid = ({ products, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse border border-slate-100">
            <div className="bg-slate-200 aspect-[4/3]" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-5 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FiPackage size={48} className="text-slate-300 mb-4" />
        <p className="text-slate-500 font-medium">Không tìm thấy sản phẩm</p>
        <p className="text-slate-400 text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((p, i) => (
        <div key={p._id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
