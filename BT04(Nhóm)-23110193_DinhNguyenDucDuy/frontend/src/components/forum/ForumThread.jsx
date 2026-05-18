import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteForumThread,
  toggleForumPin,
  toggleForumSolved,
  upvoteForumThread,
} from "../../redux/forumSlice";
import AnswerThread from "./AnswerThread";
import ReplyForm from "./ReplyForm";

const ForumThread = ({ threadId }) => {
  const dispatch = useDispatch();
  const thread = useSelector((state) =>
    state.forum.threads.find((item) => item.id === threadId),
  );
  const user = useSelector((state) => state.auth.user);
  const isAdmin = user?.role === "admin";

  if (!thread) {
    return <div className="text-sm text-gray-500">Chọn một chủ đề để xem chi tiết.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{thread.title}</h2>
          <div className="text-sm text-gray-500">
            Bởi {thread.author} • {new Date(thread.createdAt).toLocaleString()}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm font-semibold">{thread.votes || 0} ↑</div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => dispatch(upvoteForumThread(thread.id))}
              className="px-3 py-1 rounded bg-blue-50 text-blue-700"
            >
              Hữu ích
            </button>
            <button
              type="button"
              onClick={() => dispatch(toggleForumSolved(thread.id))}
              className={`px-3 py-1 rounded ${
                thread.solved ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
              }`}
            >
              {thread.solved ? "Đã giải quyết" : "Đánh dấu xong"}
            </button>
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => dispatch(toggleForumPin(thread.id))}
                  className="px-3 py-1 rounded bg-yellow-50 text-yellow-700"
                >
                  {thread.pinned ? "Bỏ ghim" : "Ghim"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Xóa chủ đề này?")) {
                      dispatch(deleteForumThread(thread.id));
                    }
                  }}
                  className="px-3 py-1 rounded bg-red-50 text-red-700"
                >
                  Xóa
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="prose max-w-none text-gray-800">{thread.content}</div>

      <div>
        <h3 className="text-lg font-semibold">Trả lời</h3>
        <div className="mt-3 space-y-3">
          <AnswerThread threadId={thread.id} replies={thread.replies || []} />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold">Viết trả lời</h3>
        <ReplyForm threadId={thread.id} />
      </div>
    </div>
  );
};

export default ForumThread;
