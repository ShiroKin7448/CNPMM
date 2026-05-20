import mongoose from "mongoose";

export const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  SHIPPING: "SHIPPING",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  CANCEL_REQUESTED: "CANCEL_REQUESTED",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: "Đơn hàng mới",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận đơn hàng",
  [ORDER_STATUS.PREPARING]: "Shop đang chuẩn bị hàng",
  [ORDER_STATUS.SHIPPING]: "Đang giao hàng",
  [ORDER_STATUS.DELIVERED]: "Đã giao thành công",
  [ORDER_STATUS.CANCELLED]: "Hủy đơn hàng",
  [ORDER_STATUS.CANCEL_REQUESTED]: "Gửi yêu cầu hủy đơn cho shop",
};

export const PAYMENT_METHOD = {
  COD: "COD",
  MOMO: "MOMO",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "Thanh toán khi nhận hàng (COD)",
  [PAYMENT_METHOD.MOMO]: "Ví MoMo",
};

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    note: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },
    momoOrderId: { type: String, default: "" },
    requestId: { type: String, default: "" },
    payUrl: { type: String, default: "" },
    deeplink: { type: String, default: "" },
    qrCodeUrl: { type: String, default: "" },
    transId: { type: String, default: "" },
    payType: { type: String, default: "" },
    resultCode: { type: Number, default: null },
    message: { type: String, default: "" },
    responseTime: { type: Number, default: null },
    refundOrderId: { type: String, default: "" },
    refundRequestId: { type: String, default: "" },
    refundTransId: { type: String, default: "" },
    refundResultCode: { type: Number, default: null },
    refundMessage: { type: String, default: "" },
    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
    cartRestoredAt: { type: Date, default: null },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
    label: { type: String, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },
    paymentStatus: {
      type: String,
      enum: ["UNPAID", "PENDING", "PAID", "FAILED", "REFUND_PENDING", "REFUNDED"],
      default: "UNPAID",
    },
    paymentInfo: {
      type: paymentInfoSchema,
      default: () => ({ provider: PAYMENT_METHOD.COD }),
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.NEW,
      index: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    confirmedAt: { type: Date, default: null },
    preparingAt: { type: Date, default: null },
    shippingAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelRequestedAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    cancelRequestFromStatus: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
