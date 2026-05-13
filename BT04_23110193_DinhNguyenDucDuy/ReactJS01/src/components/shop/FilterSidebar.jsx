import { useState, useEffect, useCallback } from "react";
import { getCategoriesApi } from "../../util/api.js";
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";

const BRANDS = ["Apple", "ASUS", "Dell", "HP", "Lenovo", "MSI", "Acer", "Microsoft", "LG", "Logitech", "Sony", "Keychron", "Tomtoc"];
const TAGS = [
  { value: "sale", label: "🔥 Đang Giảm Giá" },
  { value: "new", label: "✨ Hàng Mới" },
  { value: "best-seller", label: "🏆 Bán Chạy Nhất" },
  { value: "featured", label: "⭐ Nổi Bật" },
];
const SORTS = [
  { value: "newest", label: "Mới Nhất" },
  { value: "best-selling", label: "Bán Chạy Nhất" },
  { value: "price_asc", label: "Giá: Thấp → Cao" },
  { value: "price_desc", label: "Giá: Cao → Thấp" },
  { value: "rating", label: "Đánh Giá Cao Nhất" },
];

const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3 text-sm font-semibold text-slate-700">
        {title}
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
};

const FilterSidebar = ({ filters, onChange, onReset }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoriesApi().then(r => { if (r?.EC === 0) setCategories(r.DT); });
  }, []);

  const toggle = (field, val) => {
    onChange({ ...filters, [field]: filters[field] === val ? "" : val });
  };

  const activeCount = [filters.category, filters.brand, filters.tag, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <aside className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <FiFilter size={18} className="text-indigo-600" />
          <span>Bộ Lọc</span>
          {activeCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button onClick={onReset} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <FiX size={12} /> Xóa lọc
          </button>
        )}
      </div>

      {/* Sort */}
      <FilterSection title="Sắp Xếp">
        <select
          value={filters.sort || "newest"}
          onChange={e => onChange({ ...filters, sort: e.target.value })}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-700"
        >
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Danh Mục">
        <div className="space-y-1.5">
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => toggle("category", cat.slug)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
                filters.category === cat.slug
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Tag */}
      <FilterSection title="Loại Sản Phẩm">
        <div className="space-y-1.5">
          {TAGS.map(t => (
            <button
              key={t.value}
              onClick={() => toggle("tag", t.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                filters.tag === t.value
                  ? "bg-orange-500 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Thương Hiệu" defaultOpen={false}>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {BRANDS.map(b => (
            <button
              key={b}
              onClick={() => toggle("brand", b)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-all ${
                filters.brand === b
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Khoảng Giá" defaultOpen={false}>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Giá tối thiểu</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice || ""}
              onChange={e => onChange({ ...filters, minPrice: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Giá tối đa</label>
            <input
              type="number"
              placeholder="999,000,000"
              value={filters.maxPrice || ""}
              onChange={e => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </FilterSection>
    </aside>
  );
};

export default FilterSidebar;
