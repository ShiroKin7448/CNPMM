import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { openEditModal, deleteAdminItem } from "../../redux/adminSlice";

const columnsByModule = {
  articles: ["title", "topic", "status", "author", "updatedAt"],
  faqs: ["question", "category", "status", "updatedAt"],
};

const labels = {
  title: "Tiêu đề",
  topic: "Chủ đề",
  status: "Trạng thái",
  author: "Tác giả",
  updatedAt: "Cập nhật",
  question: "Câu hỏi",
  category: "Danh mục",
};

const AdminDataTable = () => {
  const dispatch = useDispatch();
  const { activeModule, data, searchQuery, isLoading } = useSelector(
    (state) => state.admin,
  );

  const columns = columnsByModule[activeModule] || [];
  const rows = (data[activeModule] || []).filter((item) => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return true;
    return columns.some((column) =>
      String(item[column] || "").toLowerCase().includes(keyword),
    );
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      {isLoading && (
        <div className="border-b border-gray-100 px-4 py-2 text-sm text-gray-500">
          Đang tải...
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {columns.map((column) => (
                <th key={column} className="text-left px-4 py-3 font-semibold whitespace-nowrap">
                  {labels[column] || column}
                </th>
              ))}
              <th className="text-right px-4 py-3 font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-500">
                  Chưa có dữ liệu.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column} className="px-4 py-3 text-gray-700">
                      {String(row[column] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => dispatch(openEditModal(row))}
                        className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(deleteAdminItem({ resource: activeModule, id: row.id }))
                        }
                        className="px-3 py-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDataTable;
