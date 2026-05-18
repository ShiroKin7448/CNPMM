const ForumThread = require("../models/ForumThread");
const User = require("../models/User");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getDisplayName = (user) =>
  user?.fullName || user?.username || user?.email || "Anonymous";

const formatReply = (reply) => ({
  id: reply._id.toString(),
  userId: reply.userId?.toString(),
  user: reply.user,
  content: reply.content,
  createdAt: reply.createdAt,
  updatedAt: reply.updatedAt,
});

const formatThread = (thread) => ({
  id: thread._id.toString(),
  title: thread.title,
  content: thread.content,
  authorId: thread.authorId?.toString(),
  author: thread.author,
  tags: thread.tags || [],
  solved: thread.solved,
  pinned: thread.pinned,
  votes: thread.votes || 0,
  replies: (thread.replies || []).map(formatReply),
  createdAt: thread.createdAt,
  updatedAt: thread.updatedAt,
});

exports.listThreads = async (req, res) => {
  try {
    const keyword = req.query.q?.trim();
    const filter = keyword
      ? {
          $or: [
            { title: new RegExp(escapeRegex(keyword), "i") },
            { content: new RegExp(escapeRegex(keyword), "i") },
            { tags: new RegExp(escapeRegex(keyword), "i") },
          ],
        }
      : {};

    const threads = await ForumThread.find(filter).sort({
      pinned: -1,
      updatedAt: -1,
    });

    return res.json({ threads: threads.map(formatThread) });
  } catch (err) {
    console.error("[forum:listThreads] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.getThread = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    return res.json(formatThread(thread));
  } catch (err) {
    console.error("[forum:getThread] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.createThread = async (req, res) => {
  try {
    const { title, content, tags = [] } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ message: "Tiêu đề và nội dung là bắt buộc" });
    }

    const user = await User.findById(req.user.id).select("username fullName email");
    const thread = await ForumThread.create({
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      authorId: req.user.id,
      author: getDisplayName(user),
    });

    return res.status(201).json(formatThread(thread));
  } catch (err) {
    console.error("[forum:createThread] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.createReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) {
      return res.status(400).json({ message: "Nội dung trả lời là bắt buộc" });
    }

    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    const user = await User.findById(req.user.id).select("username fullName email");
    thread.replies.push({
      userId: req.user.id,
      user: getDisplayName(user),
      content: content.trim(),
    });
    await thread.save();

    return res.status(201).json(formatThread(thread));
  } catch (err) {
    console.error("[forum:createReply] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.upvoteThread = async (req, res) => {
  try {
    const thread = await ForumThread.findByIdAndUpdate(
      req.params.id,
      { $inc: { votes: 1 } },
      { new: true },
    );

    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    return res.json(formatThread(thread));
  } catch (err) {
    console.error("[forum:upvoteThread] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.toggleSolved = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    const isOwner = thread.authorId?.toString() === req.user.id;
    if (!isOwner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền cập nhật chủ đề" });
    }

    thread.solved = !thread.solved;
    await thread.save();

    return res.json(formatThread(thread));
  } catch (err) {
    console.error("[forum:toggleSolved] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    thread.pinned = !thread.pinned;
    await thread.save();

    return res.json(formatThread(thread));
  } catch (err) {
    console.error("[forum:togglePin] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.deleteThread = async (req, res) => {
  try {
    const removed = await ForumThread.findByIdAndDelete(req.params.id);
    if (!removed) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    return res.json({ message: "Đã xóa chủ đề", id: req.params.id });
  } catch (err) {
    console.error("[forum:deleteThread] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.deleteReply = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: "Không tìm thấy chủ đề" });
    }

    const reply = thread.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Không tìm thấy trả lời" });
    }

    reply.deleteOne();
    await thread.save();

    return res.json(formatThread(thread));
  } catch (err) {
    console.error("[forum:deleteReply] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
