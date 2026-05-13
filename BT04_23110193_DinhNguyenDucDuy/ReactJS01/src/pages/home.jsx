import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/auth.context.jsx";
import { getHomeProductsApi, getCategoriesApi } from "../util/api.js";
import HeroBanner from "../components/home/HeroBanner.jsx";
import ProductSection from "../components/home/ProductSection.jsx";
import { FiShoppingBag } from "react-icons/fi";

const CategoryBar = ({ categories }) => {
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
      {categories.map(cat => (
        <button
          key={cat._id}
          onClick={() => navigate(`/shop?category=${cat.slug}`)}
          className="group bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform"
            style={{ background: cat.color + "18" }}
          >
            {cat.icon}
          </div>
          <p className="font-semibold text-slate-700 text-sm">{cat.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{cat.description}</p>
        </button>
      ))}
    </div>
  );
};

const HomePage = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ sale: [], newest: [], bestSeller: [], featured: [] });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    Promise.all([getHomeProductsApi(), getCategoriesApi()]).then(([home, cats]) => {
      if (home?.EC === 0) setData(home.DT);
      if (cats?.EC === 0) setCategories(cats.DT);
      setLoading(false);
    });
  }, [auth.isAuthenticated]);

  if (!auth.isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero */}
        <HeroBanner user={auth.user} />

        {/* Category quick-nav */}
        {categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-700 mb-4">📂 Danh Mục</h2>
            <CategoryBar categories={categories} />
          </div>
        )}

        {/* Loading skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-slate-200 aspect-[4/3]" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <ProductSection type="sale" products={data.sale} />
            <ProductSection type="bestSeller" products={data.bestSeller} />
            <ProductSection type="newest" products={data.newest} />
            <ProductSection type="featured" products={data.featured} />
          </>
        )}

        {/* Shop all CTA */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <FiShoppingBag size={20} /> Xem Tất Cả Sản Phẩm
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
