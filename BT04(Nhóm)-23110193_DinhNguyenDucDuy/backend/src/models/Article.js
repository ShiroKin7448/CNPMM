const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topic: { type: String, default: "General", trim: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
    },
    author: { type: String, default: "Admin", trim: true },
    excerpt: { type: String, default: "", trim: true },
    body: { type: String, default: "" },
    faculty: { type: String, default: "", trim: true },
    contentType: { type: String, default: "Article" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

articleSchema.index({ title: "text", excerpt: "text", body: "text", topic: "text" });

module.exports = mongoose.model("Article", articleSchema);
