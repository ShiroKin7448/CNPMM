import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSimilarProductsApi } from "../../util/api.js";
import ProductCard from "../shop/ProductCard.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FiArrowRight } from "react-icons/fi";

const SimilarProducts = ({ productId, categoryName }) => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;
    getSimilarProductsApi(productId).then(r => {
      if (r?.EC === 0) setProducts(r.DT);
    });
  }, [productId]);

  if (!products.length) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Sản Phẩm Tương Tự</h2>
          <p className="text-sm text-slate-500 mt-0.5">Cùng danh mục {categoryName}</p>
        </div>
        <button
          onClick={() => navigate("/shop")}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          Xem tất cả <FiArrowRight size={14} />
        </button>
      </div>
      <Swiper
        modules={[Navigation]}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
      >
        {products.map(p => (
          <SwiperSlide key={p._id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default SimilarProducts;
