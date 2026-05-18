import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCategory, setQuery, clearFilters } from "../../redux/faqSlice";

const FAQSearch = () => {
  const dispatch = useDispatch();
  const { categories, selectedCategory, query } = useSelector((state) => state.faq);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-5 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Tìm câu hỏi
        </label>
        <input
          value={query}
          onChange={(event) => dispatch(setQuery(event.target.value))}
          placeholder="Nhập từ khóa: học bổng, học phần, hồ sơ..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Danh mục
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => dispatch(setCategory(category))}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                selectedCategory === category
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300 hover:border-primary"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => dispatch(clearFilters())}
        className="text-sm text-primary hover:text-primary-dark"
      >
        Đặt lại bộ lọc
      </button>
    </div>
  );
};

export default FAQSearch;
