import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { HiStar } from "react-icons/hi";

const formatPrice = (n) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const BADGE_MAP = {
  "new": { label: "Mới", color: "bg-emerald-500" },
  "best-seller": { label: "Bán Chạy", color: "bg-orange-500" },
  "sale": { label: "Giảm Giá", color: "bg-red-500" },
  "featured": { label: "Nổi Bật", color: "bg-indigo-600" },
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const activePrice = product.salePrice ?? product.price;
  const discountPct = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;

  const primaryBadge = product.tags?.[0];

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 cursor-pointer transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 aspect-[4/3]">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {primaryBadge && (
            <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${BADGE_MAP[primaryBadge]?.color}`}>
              {BADGE_MAP[primaryBadge]?.label}
            </span>
          )}
          {discountPct > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Stock status */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold bg-gray-800/80 px-4 py-2 rounded-full">Hết Hàng</span>
          </div>
        )}

        {/* Quick actions */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => e.stopPropagation()}
            className="w-9 h-9 bg-white rounded-full shadow flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors"
          >
            <FiHeart size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Category */}
        {product.category && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 w-fit"
            style={{ background: product.category.color + "18", color: product.category.color }}
          >
            {product.category.icon} {product.category.name}
          </span>
        )}

        {/* Name */}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug flex-1">
          {product.name}
        </h3>

        {/* Rating & Sold */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-1 text-amber-400">
            <HiStar size={14} />
            <span className="text-xs text-slate-600 font-medium">{product.rating}</span>
          </div>
          <span className="text-xs text-slate-400">Đã bán: <b className="text-slate-600">{product.sold}</b></span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-indigo-600">{formatPrice(activePrice)}</span>
          {product.salePrice && (
            <span className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</span>
          )}
        </div>

        {/* Stock */}
        <div className="mt-2 flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className={`text-xs ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : "Hết hàng"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
