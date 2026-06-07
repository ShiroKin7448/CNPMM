import mongoose from "mongoose";

export const NOTIFICATION_AUDIENCE = {
  ADMIN: "admin",
  USER: "user",
  ALL: "all",
};

export const NOTIFICATION_TYPES = {
  ORDER_NEW: "ORDER_NEW",
  ORDER_STATUS: "ORDER_STATUS",
  ORDER_CANCEL_REQUESTED: "ORDER_CANCEL_REQUESTED",
  REVIEW_NEW: "REVIEW_NEW",
  USER_NEW: "USER_NEW",
  PRODUCT_NEW: "PRODUCT_NEW",
  VOUCHER_NEW: "VOUCHER_NEW",
  SYSTEM: "SYSTEM",
};

const readBySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const mailSchema = new mongoose.Schema(
  {
    sentAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    error: { type: String, default: "" },
    recipients: { type: [String], default: [] },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      default: NOTIFICATION_TYPES.SYSTEM,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["info", "success", "warning", "danger"],
      default: "info",
    },
    audience: {
      type: String,
      enum: Object.values(NOTIFICATION_AUDIENCE),
      default: NOTIFICATION_AUDIENCE.ADMIN,
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    targetUrl: { type: String, default: "" },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    channels: {
      type: [String],
      enum: ["database", "socket", "mail"],
      default: ["database", "socket", "mail"],
    },
    readBy: { type: [readBySchema], default: [] },
    mail: { type: mailSchema, default: () => ({}) },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ audience: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
