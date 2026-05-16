import { useState, useEffect } from "react";
import { getCategoriesApi } from "../../util/api.js";
import { FiFilter, FiX, FiChevronDown, FiChevronUp, FiTag, FiCpu, FiDollarSign } from "react-icons/fi";

const BRANDS = ["Apple", "ASUS", "Dell", "HP", "Lenovo", "MSI", "Acer", "Microsoft", "LG", "Logitech", "Sony", "Keychron", "Tomtoc"];
const TAGS = [
  { value: "sale", label: "Đang giảm giá" },
  { value: "new", label: "Hàng mới" },
  { value: "best-seller", label: "Bán chạy" },
  { value: "featured", label: "Nổi bật" },
];
const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "best-selling", label: "Bán chạy nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "rating", label: "Đánh giá cao nhất" },
];
const PRICE_PRESETS = [
  { label: "Dưới 10 triệu", minPrice: "", maxPrice: "10000000" },
  { label: "10 - 25 triệu", minPrice: "10000000", maxPrice: "25000000" },
  { label: "25 - 50 triệu", minPrice: "25000000", maxPrice: "50000000" },
  { label: "Trên 50 triệu", minPrice: "50000000", maxPrice: "" },
];

const FilterSection = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#D5D5D5] pt-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mb-4 flex w-full items-center justify-between text-sm font-extrabold text-black"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#C0FF6B] text-black">
            {icon}
          </span>
          {title}
        </span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {open && children}
    </div>
  );
};

const ChoiceButton = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full rounded-2xl px-3 py-2.5 text-left text-sm font-bold transition"
    style={{
      background: active ? "#000000" : "#ffffff",
      color: active ? "#C0FF6B" : "#656565",
      border: active ? "1px solid #000000" : "1px solid #D5D5D5",
      boxShadow: active ? "0 10px 20px rgba(0,0,0,0.14)" : "none",
    }}
  >
    {children}
  </button>
);

const FilterSidebar = ({ filters, onChange, onReset }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategoriesApi().then((r) => { if (r?.EC === 0) setCategories(r.DT); });
  }, []);

  const toggle = (field, val) => {
    onChange({ ...filters, [field]: filters[field] === val ? "" : val });
  };

  const activeCount = [filters.category, filters.brand, filters.tag, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <aside className="sticky top-20 overflow-hidden rounded-[28px] border border-[#D5D5D5] bg-white shadow-xl shadow-black/10">
      <div className="bg-black p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#C0FF6B] text-black">
              <FiFilter size={18} />
            </span>
            <div>
              <div className="text-lg font-extrabold leading-none">Bộ lọc</div>
              <div className="text-xs text-[#D5D5D5]">Tối ưu kết quả tìm kiếm</div>
            </div>
          </div>
          {activeCount > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#C0FF6B] px-2 text-xs font-extrabold text-black">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-[#D5D5D5] transition hover:text-white"
          >
            <FiX size={12} /> Xóa lọc
          </button>
        )}
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="mb-2 block text-xs font-extrabold uppercase tracking-wide text-[#656565]">
            Sắp xếp
          </label>
          <select
            value={filters.sort || "newest"}
            onChange={(e) => onChange({ ...filters, sort: e.target.value })}
            className="w-full rounded-2xl border border-[#D5D5D5] bg-[#f7f7f7] px-3 py-3 text-sm font-bold text-black outline-none focus:ring-4 focus:ring-[#C0FF6B]/50"
          >
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <FilterSection title="Danh mục" icon={<FiCpu size={16} />}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <ChoiceButton
                key={cat._id}
                active={filters.category === cat.slug}
                onClick={() => toggle("category", cat.slug)}
              >
                <span className="mr-2">{cat.icon}</span>{cat.name}
              </ChoiceButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Loại sản phẩm" icon={<FiTag size={16} />}>
          <div className="grid grid-cols-2 gap-2">
            {TAGS.map((t) => (
              <ChoiceButton key={t.value} active={filters.tag === t.value} onClick={() => toggle("tag", t.value)}>
                {t.label}
              </ChoiceButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Thương hiệu" icon={<FiFilter size={16} />} defaultOpen={false}>
          <div className="grid grid-cols-2 gap-2">
            {BRANDS.map((brand) => (
              <ChoiceButton key={brand} active={filters.brand === brand} onClick={() => toggle("brand", brand)}>
                {brand}
              </ChoiceButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Khoảng giá" icon={<FiDollarSign size={16} />} defaultOpen={false}>
          <div className="mb-3 grid grid-cols-2 gap-2">
            {PRICE_PRESETS.map((preset) => {
              const active = filters.minPrice === preset.minPrice && filters.maxPrice === preset.maxPrice;
              return (
                <ChoiceButton
                  key={preset.label}
                  active={active}
                  onClick={() => onChange({ ...filters, minPrice: preset.minPrice, maxPrice: preset.maxPrice })}
                >
                  {preset.label}
                </ChoiceButton>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Từ"
              value={filters.minPrice || ""}
              onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
              className="w-full rounded-2xl border border-[#D5D5D5] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#C0FF6B]/50"
            />
            <input
              type="number"
              placeholder="Đến"
              value={filters.maxPrice || ""}
              onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
              className="w-full rounded-2xl border border-[#D5D5D5] bg-white px-3 py-2.5 text-sm font-bold outline-none focus:ring-4 focus:ring-[#C0FF6B]/50"
            />
          </div>
        </FilterSection>
      </div>
    </aside>
  );
};

export default FilterSidebar;
