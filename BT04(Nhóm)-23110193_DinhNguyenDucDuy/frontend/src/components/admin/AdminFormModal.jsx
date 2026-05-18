import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal, createAdminItem, updateAdminItem } from "../../redux/adminSlice";

const fieldsByModule = {
  articles: ["title", "topic", "status", "author", "excerpt", "body"],
  faqs: ["question", "answer", "category", "status"],
};

const fieldLabels = {
  title: "Tiêu đề",
  topic: "Chủ đề",
  status: "Trạng thái",
  author: "Tác giả",
  excerpt: "Tóm tắt",
  body: "Nội dung",
  question: "Câu hỏi",
  answer: "Câu trả lời",
  category: "Danh mục",
};

const moduleLabels = {
  articles: "bài viết",
  faqs: "FAQ",
};

const makeInitial = (moduleKey, editingItem) => {
  const fields = fieldsByModule[moduleKey] || [];
  const base = {};
  fields.forEach((key) => {
    base[key] = editingItem?.[key] || "";
  });
  return base;
};

const AdminFormModal = () => {
  const dispatch = useDispatch();
  const { isModalOpen, modalMode, activeModule, editingItem } = useSelector(
    (state) => state.admin,
  );
  const [formData, setFormData] = React.useState(makeInitial(activeModule, editingItem));

  React.useEffect(() => {
    if (isModalOpen) {
      setFormData(makeInitial(activeModule, editingItem));
    }
  }, [isModalOpen, activeModule, editingItem]);

  if (!isModalOpen) return null;

  const fields = fieldsByModule[activeModule] || [];

  const onSubmit = (event) => {
    event.preventDefault();
    if (modalMode === "edit") {
      dispatch(
        updateAdminItem({
          resource: activeModule,
          id: editingItem.id,
          data: { ...editingItem, ...formData },
        }),
      );
      return;
    }
    dispatch(createAdminItem({ resource: activeModule, data: formData }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => dispatch(closeModal())} />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-xl bg-white rounded-xl shadow-xl p-6 space-y-4 animate-modal-in"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            {modalMode === "edit" ? "Sửa" : "Tạo"} {moduleLabels[activeModule]}
          </h3>
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="text-gray-500 hover:text-gray-700 text-lg"
          >
            ×
          </button>
        </div>

        {fields.map((field) => {
          const isTextarea = field === "body" || field === "answer" || field === "excerpt";
          return (
            <div key={field}>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {fieldLabels[field] || field}
              </label>
              {isTextarea ? (
                <textarea
                  value={formData[field] || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                  rows={field === "excerpt" ? 3 : 5}
                  required={field !== "excerpt"}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <input
                  value={formData[field] || ""}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, [field]: event.target.value }))
                  }
                  required
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
            </div>
          );
        })}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => dispatch(closeModal())}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark"
          >
            {modalMode === "edit" ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminFormModal;
