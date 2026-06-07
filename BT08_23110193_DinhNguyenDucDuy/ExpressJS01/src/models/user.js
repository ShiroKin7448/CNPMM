import mongoose from "mongoose";

const loyaltyTransactionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["PURCHASE_REWARD", "REVIEW_REWARD", "REDEEM", "REFUND"],
      required: true,
    },
    points: { type: Number, required: true },
    description: { type: String, default: "" },
    reference: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const recentlyViewedSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Fields for Forgot Password functionality
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    // Email Verification
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, default: null },
    loyaltyPoints: { type: Number, default: 0, min: 0 },
    totalSpent: { type: Number, default: 0, min: 0 },
    membershipTier: {
      type: String,
      enum: ["MEMBER", "SILVER", "GOLD", "DIAMOND"],
      default: "MEMBER",
    },
    loyaltyTransactions: {
      type: [loyaltyTransactionSchema],
      default: [],
    },
    favoriteProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    }],
    recentlyViewed: {
      type: [recentlyViewedSchema],
      default: [],
    },
  },
  {
    timestamps: true, // tự động tạo createdAt và updatedAt
  }
);

const User = mongoose.model("User", userSchema);

export default User;
