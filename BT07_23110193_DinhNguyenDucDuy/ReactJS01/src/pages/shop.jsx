import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getProductsApi } from "../util/api.js";
import FilterSidebar from "../components/shop/FilterSidebar.jsx";
import ProductGrid from "../components/shop/ProductGrid.jsx";
import { FiSearch, FiX, FiSliders, FiZap, FiGrid, FiTrendingUp } from "react-icons/fi";
import { useDebounce } from "../util/useDebounce.js";

const LIMIT = 12;
const DEFAULT_FILTERS = {
  category: "",
  tag: "",
  brand: "",
  minPrice: "",
  maxPrice: "",
  sort: "newest",
};

const TAG_LABELS = {
  sale: "Đang giảm giá",
  new: "Hàng mới",
  "best-seller": "Bán chạy",
  featured: "Nổi bật",
};

const SORT_LABELS = {
  newest: "Mới nhất",
  "best-selling": "Bán chạy nhất",
  "most-viewed": "Xem nhiều nhất",
  price_asc: "Giá thấp đến cao",
  price_desc: "Giá cao đến thấp",
  rating: "Đánh giá cao nhất",
};

const getFiltersFromParams = (params) => ({
  category: params.get("category") || "",
  tag: params.get("tag") || "",
  brand: params.get("brand") || "",
  minPrice: params.get("minPrice") || "",
  maxPrice: params.get("maxPrice") || "",
  sort: params.get("sort") || "newest",
});

const buildParams = (filters, search) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;
    if (key === "sort" && value === "newest") return;
    params.set(key, value);
  });
  if (search.trim()) params.set("search", search.trim());
  return params;
};

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParamString = searchParams.toString();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filters, setFilters] = useState(() => getFiltersFromParams(searchParams));
  const loadMoreRef = useRef(null);

  const debouncedSearch = useDebounce(search, 400);
  const activeParams = useMemo(
    () => buildParams(filters, debouncedSearch),
    [filters, debouncedSearch]
  );

  useEffect(() => {
    const nextFilters = getFiltersFromParams(searchParams);
    const nextSearch = searchParams.get("search") || "";

    if (JSON.stringify(nextFilters) !== JSON.stringify(filters)) setFilters(nextFilters);
    if (nextSearch !== search) setSearch(nextSearch);
  }, [searchParamString]);

  useEffect(() => {
    const nextString = activeParams.toString();
    if (nextString !== searchParamString) {
      setSearchParams(activeParams, { replace: true });
    }
  }, [activeParams, searchParamString, setSearchParams]);

  const fetchProducts = useCallback(async (nextPage = 1, mode = "replace") => {
    const append = mode === "append";
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = Object.fromEntries(activeParams.entries());
      const res = await getProductsApi({ ...params, page: nextPage, limit: LIMIT });
      if (res?.EC === 0) {
        setProducts((prev) => append ? [...prev, ...res.DT.products] : res.DT.products);
        setPagination(res.DT.pagination);
      }
    } finally {
      if (append) setLoadingMore(false);
      else setLoading(false);
    }
  }, [activeParams]);

  useEffect(() => {
    fetchProducts(1, "replace");
  }, [fetchProducts]);

  useEffect(() => {
    const node = loadMoreRef.current;
    const hasMore = pagination.page < pagination.totalPages;
    if (!node || !hasMore || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchProducts(pagination.page + 1, "append");
        }
      },
      { rootMargin: "260px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchProducts, pagination.page, pagination.totalPages, loading, loadingMore]);

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
    setSearchParams({}, { replace: true });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const removeFilter = (key) => {
    if (key === "search") setSearch("");
    else setFilters((prev) => ({ ...prev, [key]: key === "sort" ? "newest" : "" }));
  };

  const activeChips = [
    search && { key: "search", label: `Từ khóa: ${search}` },
    filters.category && { key: "category", label: `Danh mục: ${filters.category}` },
    filters.tag && { key: "tag", label: `Loại: ${TAG_LABELS[filters.tag] || filters.tag}` },
    filters.brand && { key: "brand", label: `Hãng: ${filters.brand}` },
    filters.minPrice && { key: "minPrice", label: `Từ ${Number(filters.minPrice).toLocaleString("vi-VN")}đ` },
    filters.maxPrice && { key: "maxPrice", label: `Đến ${Number(filters.maxPrice).toLocaleString("vi-VN")}đ` },
    filters.sort !== "newest" && { key: "sort", label: `Sắp xếp: ${SORT_LABELS[filters.sort] || filters.sort}` },
  ].filter(Boolean);

  const hasMore = pagination.page < pagination.totalPages;
  const firstLoading = loading && products.length === 0;

  return (
    <div className="min-h-screen bg-transparent">
      <div
        className="border-b border-[#D5D5D5]"
        style={{
          background:
            "radial-gradient(circle at 18% 0%, rgba(192,255,107,0.45), transparent 28%), linear-gradient(135deg,#000 0%,#303030 58%,#656565 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-9 text-white">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold text-[#C0FF6B] backdrop-blur">
                <FiZap size={14} /> Bộ lọc thông minh
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
                Cửa Hàng Laptop & Phụ Kiện
              </h1>
              <p className="mt-3 max-w-2xl text-sm md:text-base text-[#D5D5D5]">
                Tìm nhanh đúng sản phẩm theo danh mục, hãng, mức giá và xu hướng bán chạy.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[280px]">
              {[
                { icon: <FiGrid />, value: loading ? "..." : pagination.total, label: "Sản phẩm" },
                { icon: <FiSliders />, value: activeChips.length, label: "Bộ lọc" },
                { icon: <FiTrendingUp />, value: `${pagination.page}/${pagination.totalPages || 1}`, label: "Đợt tải" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <div className="mb-2 text-[#C0FF6B]">{item.icon}</div>
                  <div className="text-xl font-extrabold">{item.value}</div>
                  <div className="text-[11px] uppercase tracking-wide text-[#D5D5D5]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/15 bg-white/12 p-3 shadow-2xl shadow-black/20 backdrop-blur-md">
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#656565]" size={18} />
              <input
                id="shop-search"
                type="text"
                placeholder="Tìm laptop, phụ kiện, thương hiệu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-[#D5D5D5] bg-white py-4 pl-12 pr-12 text-sm font-semibold text-black shadow-sm outline-none transition focus:ring-4 focus:ring-[#C0FF6B]/50"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#656565] hover:text-black"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeChips.length > 0 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={() => removeFilter(chip.key)}
                className="inline-flex items-center gap-2 rounded-full border border-[#D5D5D5] bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm transition hover:border-black"
              >
                {chip.label} <FiX size={12} />
              </button>
            ))}
            <button type="button" onClick={resetFilters} className="text-xs font-extrabold text-[#656565] underline">
              Xóa tất cả
            </button>
          </div>
        )}

        <div className="lg:hidden mb-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B] shadow-lg shadow-black/20"
          >
            <FiSliders size={16} /> Bộ Lọc
          </button>
        </div>

        <div className="flex gap-6">
          <div className="hidden lg:block w-72 flex-shrink-0">
            <FilterSidebar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
          </div>

          <div className="flex-1 min-w-0">
            <ProductGrid products={products} loading={firstLoading} onReset={resetFilters} />

            {products.length > 0 && (
              <div ref={loadMoreRef} className="mt-9 flex min-h-16 items-center justify-center">
                {loadingMore && (
                  <div className="flex items-center gap-3 rounded-full border border-[#D5D5D5] bg-white px-5 py-3 text-sm font-extrabold text-black shadow-sm">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-[#C0FF6B]" />
                    Đang tải thêm sản phẩm
                  </div>
                )}
                {!loadingMore && !hasMore && (
                  <div className="rounded-full border border-[#D5D5D5] bg-white px-5 py-3 text-sm font-bold text-[#656565] shadow-sm">
                    Đã hiển thị {products.length.toLocaleString("vi-VN")} sản phẩm
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative ml-auto h-full w-80 max-w-[88vw] overflow-y-auto bg-[#f3f3f3] p-5 shadow-2xl">
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-5 top-5 text-[#656565] hover:text-black"
              >
                <FiX size={20} />
              </button>
              <FilterSidebar
                filters={filters}
                onChange={(f) => { handleFilterChange(f); setSidebarOpen(false); }}
                onReset={() => { resetFilters(); setSidebarOpen(false); }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
