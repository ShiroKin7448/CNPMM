import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    icon: { type: String, default: "💻" },
    color: { type: String, default: "#4F46E5" }, // accent color cho UI
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
