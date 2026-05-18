import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteForumReply } from "../../redux/forumSlice";

const AnswerThread = ({ threadId, replies = [] }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-4">
      {replies.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có trả lời.</div>
      ) : (
        replies.map((reply) => (
          <div key={reply.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm text-gray-800 font-semibold">{reply.user}</div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() =>
                    dispatch(deleteForumReply({ threadId, replyId: reply.id }))
                  }
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              )}
            </div>
            <div className="mt-1 prose max-w-none text-gray-700">{reply.content}</div>
            <div className="text-xs text-gray-400 mt-2">
              {new Date(reply.createdAt).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AnswerThread;
