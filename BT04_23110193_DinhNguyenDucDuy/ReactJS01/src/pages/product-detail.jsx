import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductDetailApi } from "../util/api.js";
import ImageSwiper from "../components/product/ImageSwiper.jsx";
import QuantitySelector from "../components/product/QuantitySelector.jsx";
import SimilarProducts from "../components/product/SimilarProducts.jsx";
import { HiStar, HiCheck, HiX } from "react-icons/hi";
import { FiShoppingCart, FiArrowLeft, FiPackage, FiTruck, FiShield } from "react-icons/fi";
import { message } from "antd";

const fmt = n => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const SpecRow = ({ label, value }) =>
  value ? (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-2.5 pr-4 text-sm text-slate-500 font-medium w-36">{label}</td>
      <td className="py-2.5 text-sm text-slate-800 font-medium">{value}</td>
    </tr>
  ) : null;

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setLoading(true);
    setQty(1);
    getProductDetailApi(id).then(r => {
      if (r?.EC === 0) setProduct(r.DT);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <span className="text-6xl">😕</span>
        <p className="text-slate-600 font-semibold">Không tìm thấy sản phẩm</p>
        <button onClick={() => navigate("/shop")} className="text-indigo-600 hover:underline text-sm">← Quay lại cửa hàng</button>
      </div>
    );
  }

  const activePrice = product.salePrice ?? product.price;
  const discount = product.salePrice ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
  const inStock = product.stock > 0;

  const BADGE_MAP = {
    "new": { label: "Mới", cls: "bg-emerald-100 text-emerald-700" },
    "best-seller": { label: "🏆 Bán Chạy", cls: "bg-amber-100 text-amber-700" },
    "sale": { label: "🔥 Sale", cls: "bg-red-100 text-red-600" },
    "featured": { label: "⭐ Nổi Bật", cls: "bg-indigo-100 text-indigo-700" },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <button onClick={() => navigate("/")} className="hover:text-indigo-600 transition-colors">Trang chủ</button>
          <span>/</span>
          <button onClick={() => navigate("/shop")} className="hover:text-indigo-600 transition-colors">Cửa hàng</button>
          {product.category && (
            <>
              <span>/</span>
              <button onClick={() => navigate(`/shop?category=${product.category.slug}`)} className="hover:text-indigo-600 transition-colors">
                {product.category.name}
              </button>
            </>
          )}
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* LEFT — Images */}
          <div className="fade-in-up">
            <ImageSwiper images={product.images} productName={product.name} />
          </div>

          {/* RIGHT — Info */}
          <div className="fade-in-up" style={{ animationDelay: "0.1s" }}>
            {/* Category badge */}
            {product.category && (
              <button
                onClick={() => navigate(`/shop?category=${product.category.slug}`)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-3 hover:opacity-80 transition-opacity"
                style={{ background: product.category.color + "18", color: product.category.color }}
              >
                {product.category.icon} {product.category.name}
              </button>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {product.tags?.map(t => (
                <span key={t} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${BADGE_MAP[t]?.cls}`}>
                  {BADGE_MAP[t]?.label}
                </span>
              ))}
            </div>

            {/* Name */}
            <h1 className="text-2xl font-bold text-slate-800 leading-snug mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <HiStar key={i} size={18} className={i < Math.round(product.rating) ? "text-amber-400" : "text-slate-200"} />
                ))}
                <span className="text-sm text-slate-600 ml-1">{product.rating}</span>
              </div>
              <span className="text-sm text-slate-400">({product.reviewCount} đánh giá)</span>
              <span className="text-sm text-slate-500">Đã bán: <b className="text-slate-700">{product.sold}</b></span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 mb-5 border border-indigo-100">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-indigo-600">{fmt(activePrice)}</span>
                {product.salePrice && (
                  <span className="text-lg text-slate-400 line-through">{fmt(product.price)}</span>
                )}
                {discount > 0 && (
                  <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>
              {product.salePrice && (
                <p className="text-sm text-emerald-600 font-medium mt-1.5">
                  💰 Tiết kiệm {fmt(product.price - product.salePrice)}
                </p>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 mb-5 text-sm font-semibold ${inStock ? "text-emerald-600" : "text-red-500"}`}>
              {inStock
                ? <><HiCheck size={18} /> Còn {product.stock} sản phẩm trong kho</>
                : <><HiX size={18} /> Hết hàng</>
              }
            </div>

            {/* Quantity + Add to cart */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <QuantitySelector value={qty} onChange={setQty} max={product.stock} />
                <button
                  onClick={() => message.success(`Đã thêm ${qty} sản phẩm vào giỏ hàng!`)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
                >
                  <FiShoppingCart size={18} /> Thêm Vào Giỏ
                </button>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: <FiTruck size={18} />, label: "Giao 2H nội thành", color: "text-blue-600 bg-blue-50" },
                { icon: <FiShield size={18} />, label: "Bảo hành chính hãng", color: "text-emerald-600 bg-emerald-50" },
                { icon: <FiPackage size={18} />, label: "Đổi trả 30 ngày", color: "text-orange-600 bg-orange-50" },
              ].map(b => (
                <div key={b.label} className={`${b.color} rounded-xl p-3 text-center`}>
                  <div className="flex justify-center mb-1">{b.icon}</div>
                  <p className="text-xs font-medium leading-tight">{b.label}</p>
                </div>
              ))}
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-slate-500">Thương hiệu: <span className="font-semibold text-slate-700">{product.brand}</span></p>
            )}
          </div>
        </div>

        {/* Specs Table */}
        {product.specs && Object.values(product.specs).some(Boolean) && (
          <div className="mt-10 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">📋 Thông Số Kỹ Thuật</h2>
            <table className="w-full">
              <tbody>
                <SpecRow label="CPU / Chip" value={product.specs.cpu} />
                <SpecRow label="RAM" value={product.specs.ram} />
                <SpecRow label="Lưu Trữ" value={product.specs.storage} />
                <SpecRow label="Màn Hình" value={product.specs.display} />
                <SpecRow label="GPU" value={product.specs.gpu} />
                <SpecRow label="Pin" value={product.specs.battery} />
                <SpecRow label="Hệ Điều Hành" value={product.specs.os} />
                <SpecRow label="Trọng Lượng" value={product.specs.weight} />
              </tbody>
            </table>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-3">📝 Mô Tả Sản Phẩm</h2>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Similar products */}
        <SimilarProducts productId={id} categoryName={product.category?.name} />
      </div>
    </div>
  );
};

export default ProductDetailPage;
