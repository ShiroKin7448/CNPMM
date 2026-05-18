import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveModule } from "../../redux/adminSlice";

const labels = {
  articles: "Bài viết",
  faqs: "FAQ",
};

const AdminTabs = () => {
  const dispatch = useDispatch();
  const { moduleOrder, activeModule } = useSelector((state) => state.admin);

  return (
    <div className="bg-white rounded-xl shadow-md p-3">
      <div className="flex flex-wrap gap-2">
        {moduleOrder.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => dispatch(setActiveModule(key))}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeModule === key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {labels[key]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminTabs;

