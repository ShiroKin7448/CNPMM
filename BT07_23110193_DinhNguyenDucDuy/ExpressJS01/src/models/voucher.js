import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    discountType: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: null, min: 0 },
    startAt: { type: Date, default: Date.now },
    endAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 1000, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    maxUsagePerUser: { type: Number, default: 1, min: 1 },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ["PROMOTION", "REVIEW", "ADMIN"],
      default: "PROMOTION",
    },
    isPublic: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
