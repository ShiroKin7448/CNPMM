import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../util/api.js";
import FilterSidebar from "../components/shop/FilterSidebar.jsx";
import ProductGrid from "../components/shop/ProductGrid.jsx";
import { FiSearch, FiX, FiSliders } from "react-icons/fi";
import { useDebounce } from "../util/useDebounce.js";

const LIMIT = 12;

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    tag: searchParams.get("tag") || "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, search: debouncedSearch, page, limit: LIMIT };
      const res = await getProductsApi(params);
      if (res?.EC === 0) {
        setProducts(res.DT.products);
        setPagination(res.DT.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const resetFilters = () => {
    setFilters({ category: "", tag: "", brand: "", minPrice: "", maxPrice: "", sort: "newest" });
    setSearch("");
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            🛒 Cửa Hàng Laptop & Phụ Kiện
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Đang tải..." : `${pagination.total} sản phẩm`}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            id="shop-search"
            type="text"
            placeholder="Tìm kiếm laptop, phụ kiện, thương hiệu..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700 placeholder:text-slate-400"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <FiX size={16} />
            </button>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
            >
              <FiSliders size={16} className="text-indigo-600" /> Bộ Lọc
            </button>
          </div>

          {/* Products area */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={loading} />

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                      p === page
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto w-72 bg-white h-full overflow-y-auto shadow-2xl p-5">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
                <FiX size={20} />
              </button>
              <FilterSidebar filters={filters} onChange={f => { handleFilterChange(f); setSidebarOpen(false); }} onReset={() => { resetFilters(); setSidebarOpen(false); }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
