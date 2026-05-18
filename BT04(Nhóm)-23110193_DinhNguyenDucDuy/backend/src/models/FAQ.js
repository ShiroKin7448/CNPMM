const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    category: { type: String, default: "General", trim: true },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
    },
  },
  { timestamps: true },
);

faqSchema.index({ question: "text", answer: "text", category: "text" });

module.exports = mongoose.model("FAQ", faqSchema);
