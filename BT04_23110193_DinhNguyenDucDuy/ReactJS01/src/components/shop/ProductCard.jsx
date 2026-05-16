import { useNavigate } from "react-router-dom";
import { FiCpu, FiHardDrive, FiHeart, FiShoppingBag } from "react-icons/fi";
import { HiStar } from "react-icons/hi";

const formatPrice = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const BADGE_MAP = {
  new: { label: "Mới", style: { background: "#C0FF6B", color: "#000000" } },
  "best-seller": { label: "Bán chạy", style: { background: "#000000", color: "#C0FF6B" } },
  sale: { label: "Giảm giá", style: { background: "#656565", color: "#ffffff" } },
  featured: { label: "Nổi bật", style: { background: "#D5D5D5", color: "#000000" } },
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const activePrice = product.salePrice ?? product.price;
  const discountPct = product.salePrice
    ? Math.round((1 - product.salePrice / product.price) * 100)
    : 0;
  const primaryBadge = product.tags?.[0];
  const categoryColor = product.category?.color || "#656565";
  const categoryText = categoryColor === "#C0FF6B" ? "#000000" : categoryColor;
  const categoryBg = categoryColor === "#C0FF6B" ? "rgba(192,255,107,0.28)" : `${categoryColor}18`;
  const specs = [
    product.specs?.cpu && { icon: <FiCpu size={12} />, text: product.specs.cpu },
    product.specs?.storage && { icon: <FiHardDrive size={12} />, text: product.specs.storage },
  ].filter(Boolean);

  const goToDetail = () => navigate(`/product/${product._id}`);

  return (
    <article
      onClick={goToDetail}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-[26px] border border-[#D5D5D5] bg-white shadow-sm shadow-black/5 transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-2xl hover:shadow-black/18"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#D5D5D5]">
        <img
          src={product.images?.[0] || "https://via.placeholder.com/600x450?text=No+Image"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/65 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {primaryBadge && BADGE_MAP[primaryBadge] && (
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide shadow-lg shadow-black/15"
              style={BADGE_MAP[primaryBadge].style}
            >
              {BADGE_MAP[primaryBadge].label}
            </span>
          )}
          {discountPct > 0 && (
            <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-extrabold text-[#C0FF6B] shadow-lg shadow-black/20">
              -{discountPct}%
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-black shadow-lg shadow-black/15 backdrop-blur transition hover:bg-[#C0FF6B]"
          aria-label="Yêu thích"
        >
          <FiHeart size={16} />
        </button>

        {product.stock === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <span className="rounded-full bg-[#C0FF6B] px-4 py-2 text-sm font-extrabold text-black">
              Hết hàng
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          {product.category && (
            <span
              className="inline-flex max-w-full items-center gap-1 truncate rounded-full px-2.5 py-1 text-[11px] font-extrabold"
              style={{ background: categoryBg, color: categoryText }}
            >
              <span>{product.category.icon}</span>
              <span className="truncate">{product.category.name}</span>
            </span>
          )}
          <span className="shrink-0 text-[11px] font-extrabold uppercase tracking-wide text-[#656565]">
            {product.brand}
          </span>
        </div>

        <h3 className="line-clamp-2 min-h-[42px] text-sm font-extrabold leading-snug text-black">
          {product.name}
        </h3>

        {specs.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {specs.map((spec) => (
              <div
                key={spec.text}
                className="flex min-w-0 items-center gap-1.5 rounded-2xl border border-[#D5D5D5] bg-[#f6f6f6] px-2.5 py-2 text-[11px] font-bold text-[#656565]"
              >
                <span className="text-black">{spec.icon}</span>
                <span className="truncate">{spec.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-black px-2 py-1 text-[#C0FF6B]">
            <HiStar size={14} />
            <span className="text-[11px] font-extrabold">{product.rating}</span>
          </div>
          <span className="text-xs font-semibold text-[#656565]">
            Đã bán <b className="text-black">{product.sold}</b>
          </span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-extrabold text-black">{formatPrice(activePrice)}</span>
            {product.salePrice && (
              <span className="text-xs font-semibold text-[#656565] line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: product.stock > 0 ? "#C0FF6B" : "#000000" }}
              />
              <span className="text-xs font-bold text-[#656565]">
                {product.stock > 0 ? `Còn ${product.stock}` : "Hết hàng"}
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToDetail();
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-black px-3 py-2 text-xs font-extrabold text-[#C0FF6B] transition hover:bg-[#C0FF6B] hover:text-black"
            >
              <FiShoppingBag size={13} />
              Xem
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
