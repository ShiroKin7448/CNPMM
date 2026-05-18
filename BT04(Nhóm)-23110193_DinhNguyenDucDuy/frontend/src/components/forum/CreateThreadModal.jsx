import React from "react";
import { useDispatch } from "react-redux";
import { createForumThread } from "../../redux/forumSlice";

const forumCategories = [
  "Academic Affairs",
  "Scholarships",
  "Internships",
  "Jobs",
  "Soft Skills",
  "Student Psychology",
];

const CreateThreadModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [tags, setTags] = React.useState([]);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [open]);

  const toggleTag = (tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const onSubmit = (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    dispatch(createForumThread({ title: title.trim(), content: content.trim(), tags }));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl p-6 space-y-4 animate-modal-in"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Đặt câu hỏi</h3>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Tiêu đề</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tóm tắt câu hỏi trong một câu"
            className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Nội dung</label>
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={6}
            placeholder="Mô tả chi tiết vấn đề và bối cảnh cần tư vấn"
            className="mt-1 w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Danh mục</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {forumCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => toggleTag(category)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition border ${
                  tags.includes(category)
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-100 text-gray-700 border-transparent hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm"
          >
            Hủy
          </button>
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-white text-sm">
            Đăng câu hỏi
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateThreadModal;
