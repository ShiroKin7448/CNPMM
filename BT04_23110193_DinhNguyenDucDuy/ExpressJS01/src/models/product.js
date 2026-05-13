import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: { type: String, default: "" },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    salePrice: {
      type: Number,
      default: null, // null = không giảm giá
      min: 0,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => v.length <= 8,
        message: "Maximum 8 images per product",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: { type: String, trim: true, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    // Thông số kỹ thuật linh hoạt
    specs: {
      cpu: { type: String, default: "" },
      ram: { type: String, default: "" },
      storage: { type: String, default: "" },
      display: { type: String, default: "" },
      gpu: { type: String, default: "" },
      battery: { type: String, default: "" },
      os: { type: String, default: "" },
      weight: { type: String, default: "" },
    },
    // Tags để phân loại: new, best-seller, sale, featured
    tags: {
      type: [String],
      enum: ["new", "best-seller", "sale", "featured"],
      default: [],
    },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Index để tìm kiếm
productSchema.index({ name: "text", description: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;
