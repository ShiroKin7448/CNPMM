import React from "react";
import { useDispatch } from "react-redux";
import { createForumReply } from "../../redux/forumSlice";

const ReplyForm = ({ threadId }) => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState("");

  const onSubmit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    dispatch(createForumReply({ threadId, content: value }));
    setValue("");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
        placeholder="Nhập nội dung trả lời"
        className="w-full border border-gray-300 rounded p-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex justify-end">
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg">
          Gửi trả lời
        </button>
      </div>
    </form>
  );
};

export default ReplyForm;
