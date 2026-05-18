import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleExpand, expandAll, collapseAll } from "../../redux/faqSlice";

const FAQAccordion = () => {
  const dispatch = useDispatch();
  const { filteredFAQs, expandedIds, isLoading } = useSelector((state) => state.faq);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-600 text-center">
        Đang tải FAQ...
      </div>
    );
  }

  if (filteredFAQs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-gray-600 text-center">
        Không tìm thấy câu hỏi phù hợp.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-900">FAQ</h2>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            onClick={() => dispatch(expandAll())}
            className="text-primary hover:text-primary-dark"
          >
            Mở tất cả
          </button>
          <button
            type="button"
            onClick={() => dispatch(collapseAll())}
            className="text-primary hover:text-primary-dark"
          >
            Thu gọn
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filteredFAQs.map((item) => {
          const isOpen = expandedIds.includes(item.id);
          return (
            <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => dispatch(toggleExpand(item.id))}
                className="w-full flex items-center justify-between text-left px-4 py-3 bg-gray-50 hover:bg-gray-100"
              >
                <div>
                  <p className="text-sm text-gray-500 mb-1">{item.category}</p>
                  <p className="font-semibold text-gray-900">{item.question}</p>
                </div>
                <span className="text-gray-500">{isOpen ? "−" : "+"}</span>
              </button>

              {isOpen && (
                <div className="px-4 py-3 text-gray-700 leading-7 bg-white">
                  <div className="prose max-w-none text-gray-700">{item.answer}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQAccordion;
