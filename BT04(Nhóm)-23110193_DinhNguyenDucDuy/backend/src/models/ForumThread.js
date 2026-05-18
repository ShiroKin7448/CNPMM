const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    user: { type: String, default: "Anonymous", trim: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true },
);

const forumThreadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    author: { type: String, default: "Anonymous", trim: true },
    tags: [{ type: String, trim: true }],
    solved: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    votes: { type: Number, default: 0 },
    replies: [replySchema],
  },
  { timestamps: true },
);

forumThreadSchema.index({ title: "text", content: "text", tags: "text" });
forumThreadSchema.index({ pinned: -1, updatedAt: -1 });

module.exports = mongoose.model("ForumThread", forumThreadSchema);
