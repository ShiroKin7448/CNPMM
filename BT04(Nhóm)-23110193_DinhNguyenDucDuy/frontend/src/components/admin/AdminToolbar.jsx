import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery, openCreateModal } from "../../redux/adminSlice";

const AdminToolbar = () => {
  const dispatch = useDispatch();
  const { searchQuery, activeModule } = useSelector((state) => state.admin);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
      <input
        value={searchQuery}
        onChange={(event) => dispatch(setSearchQuery(event.target.value))}
        placeholder={`Tìm trong ${activeModule === "articles" ? "bài viết" : "FAQ"}...`}
        className="w-full md:max-w-sm border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      <button
        type="button"
        onClick={() => dispatch(openCreateModal())}
        className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold"
      >
        + Tạo mới
      </button>
    </div>
  );
};

export default AdminToolbar;

