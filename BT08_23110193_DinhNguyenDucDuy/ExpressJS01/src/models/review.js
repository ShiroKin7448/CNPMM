import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, maxlength: 1000 },
    rewardType: {
      type: String,
      enum: ["POINTS", "VOUCHER"],
      required: true,
    },
    rewardPoints: { type: Number, default: 0, min: 0 },
    rewardVoucherCode: { type: String, default: "" },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
