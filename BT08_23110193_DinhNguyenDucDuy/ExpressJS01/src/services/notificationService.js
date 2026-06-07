import mongoose from "mongoose";
import Notification, {
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_TYPES,
} from "../models/notification.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import { ORDER_STATUS_LABELS } from "../models/order.js";
import { emitAdminAnalyticsRefresh, emitNotification } from "./socketService.js";
import { sendNotificationMail } from "./mailService.js";

const toObjectId = (id) => (mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null);

const notificationForUser = (notification, userId) => {
  const plain = typeof notification.toObject === "function" ? notification.toObject() : notification;
  const read = (plain.readBy || []).some((entry) => entry.user?.toString() === userId?.toString());
  return {
    ...plain,
    read,
    readBy: undefined,
  };
};

const getAdminEmails = async () => {
  const envEmails = (process.env.NOTIFICATION_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);
  if (envEmails.length) return envEmails;

  const admins = await User.find({ role: "admin" }).select("email").lean();
  return admins.map((admin) => admin.email).filter(Boolean);
};

const getRecipientsForMail = async (notification) => {
  if (notification.audience === NOTIFICATION_AUDIENCE.ADMIN) return getAdminEmails();
  if (notification.recipient) {
    const user = await User.findById(notification.recipient).select("email").lean();
    return user?.email ? [user.email] : [];
  }
  if (notification.audience === NOTIFICATION_AUDIENCE.ALL) {
    const users = await User.find({}).select("email").limit(50).lean();
    return users.map((user) => user.email).filter(Boolean);
  }
  return [];
};

const persistMailState = async (notification, mailResult, error = null) => {
  notification.mail = {
    recipients: mailResult?.recipients || notification.mail?.recipients || [],
    sentAt: mailResult?.ok ? new Date() : null,
    failedAt: error ? new Date() : null,
    error: error?.message || "",
  };
  await notification.save();
};

export const createNotificationService = async ({
  type = NOTIFICATION_TYPES.SYSTEM,
  title,
  message,
  severity = "info",
  audience = NOTIFICATION_AUDIENCE.ADMIN,
  recipient = null,
  targetUrl = "",
  metadata = {},
  channels = ["database", "socket", "mail"],
  sendMail = true,
}) => {
  const notification = await Notification.create({
    type,
    title,
    message,
    severity,
    audience,
    recipient,
    targetUrl,
    metadata,
    channels,
  });

  if (channels.includes("socket")) emitNotification(notification);

  if (sendMail && channels.includes("mail")) {
    try {
      const recipients = await getRecipientsForMail(notification);
      const mailResult = await sendNotificationMail({
        to: recipients,
        subject: `[LaptopStore BT08] ${title}`,
        title,
        message,
        targetUrl,
      });
      await persistMailState(notification, mailResult);
    } catch (error) {
      console.error("send notification mail error:", error);
      await persistMailState(notification, null, error);
    }
  }

  return notification;
};

export const getNotificationsService = async (user, query = {}) => {
  const userId = toObjectId(user?.id);
  if (!userId) return { EC: 1, EM: "Tài khoản không hợp lệ", DT: null };

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  const skip = (page - 1) * limit;
  const role = user?.role === "admin" ? NOTIFICATION_AUDIENCE.ADMIN : NOTIFICATION_AUDIENCE.USER;
  const visibility = {
    $or: [
      { audience: NOTIFICATION_AUDIENCE.ALL },
      { audience: role },
      { recipient: userId },
    ],
  };
  const filter = query.unread === "true"
    ? { ...visibility, readBy: { $not: { $elemMatch: { user: userId } } } }
    : visibility;

  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ ...visibility, readBy: { $not: { $elemMatch: { user: userId } } } }),
  ]);

  return {
    EC: 0,
    EM: "Lấy thông báo thành công",
    DT: {
      notifications: items.map((item) => notificationForUser(item, userId)),
      unread,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  };
};

export const markNotificationReadService = async (user, notificationId) => {
  const userId = toObjectId(user?.id);
  if (!userId || !mongoose.Types.ObjectId.isValid(notificationId)) {
    return { EC: 1, EM: "Thông báo không hợp lệ", DT: null };
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) return { EC: 1, EM: "Không tìm thấy thông báo", DT: null };

  const alreadyRead = notification.readBy.some((entry) => entry.user.toString() === userId.toString());
  if (!alreadyRead) {
    notification.readBy.push({ user: userId, readAt: new Date() });
    await notification.save();
  }

  return { EC: 0, EM: "Đã đánh dấu đã đọc", DT: notificationForUser(notification, userId) };
};

export const markAllNotificationsReadService = async (user) => {
  const userId = toObjectId(user?.id);
  if (!userId) return { EC: 1, EM: "Tài khoản không hợp lệ", DT: null };
  const role = user?.role === "admin" ? NOTIFICATION_AUDIENCE.ADMIN : NOTIFICATION_AUDIENCE.USER;
  const visibility = {
    $or: [
      { audience: NOTIFICATION_AUDIENCE.ALL },
      { audience: role },
      { recipient: userId },
    ],
    readBy: { $not: { $elemMatch: { user: userId } } },
  };

  await Notification.updateMany(visibility, {
    $push: { readBy: { user: userId, readAt: new Date() } },
  });

  return { EC: 0, EM: "Đã đánh dấu tất cả thông báo", DT: null };
};

export const notifyNewOrder = async (order) => createNotificationService({
  type: NOTIFICATION_TYPES.ORDER_NEW,
  title: `Đơn hàng mới #${order.orderCode}`,
  message: `Khách ${order.shippingAddress?.fullName || "mới"} vừa đặt đơn ${Math.round(order.total).toLocaleString("vi-VN")} VND.`,
  severity: "success",
  audience: NOTIFICATION_AUDIENCE.ADMIN,
  targetUrl: "/admin",
  metadata: {
    orderId: order._id,
    orderCode: order.orderCode,
    total: order.total,
    status: order.status,
  },
});

export const notifyCancelRequest = async (order) => createNotificationService({
  type: NOTIFICATION_TYPES.ORDER_CANCEL_REQUESTED,
  title: `Yêu cầu hủy đơn #${order.orderCode}`,
  message: `Khách hàng gửi yêu cầu hủy đơn. Lý do: ${order.cancelReason || "Không có"}.`,
  severity: "warning",
  audience: NOTIFICATION_AUDIENCE.ADMIN,
  targetUrl: "/admin",
  metadata: {
    orderId: order._id,
    orderCode: order.orderCode,
    total: order.total,
    status: order.status,
  },
});

export const notifyOrderStatusChanged = async (order, previousStatus) => createNotificationService({
  type: NOTIFICATION_TYPES.ORDER_STATUS,
  title: `Đơn #${order.orderCode} đã cập nhật`,
  message: `Trạng thái đơn hàng chuyển từ ${ORDER_STATUS_LABELS[previousStatus] || previousStatus} sang ${ORDER_STATUS_LABELS[order.status] || order.status}.`,
  severity: order.status === "DELIVERED" ? "success" : "info",
  audience: NOTIFICATION_AUDIENCE.USER,
  recipient: order.user,
  targetUrl: `/orders/${order._id}`,
  metadata: {
    orderId: order._id,
    orderCode: order.orderCode,
    previousStatus,
    status: order.status,
    total: order.total,
  },
});

export const notifyNewReview = async (review) => {
  const product = await Product.findById(review.product).select("name").lean();
  return createNotificationService({
    type: NOTIFICATION_TYPES.REVIEW_NEW,
    title: "Đánh giá sản phẩm mới",
    message: `Có đánh giá ${review.rating} sao cho ${product?.name || "sản phẩm"}.`,
    severity: "info",
    audience: NOTIFICATION_AUDIENCE.ADMIN,
    targetUrl: `/product/${review.product}`,
    metadata: {
      reviewId: review._id,
      productId: review.product,
      orderId: review.order,
      rating: review.rating,
    },
  });
};

export const notifyNewUser = async (user) => createNotificationService({
  type: NOTIFICATION_TYPES.USER_NEW,
  title: "Khách hàng mới đăng ký",
  message: `${user.name} (${user.email}) vừa tạo tài khoản.`,
  severity: "info",
  audience: NOTIFICATION_AUDIENCE.ADMIN,
  targetUrl: "/user",
  metadata: {
    userId: user._id,
    email: user.email,
  },
});

export const notifyNewProduct = async (product) => createNotificationService({
  type: NOTIFICATION_TYPES.PRODUCT_NEW,
  title: "Sản phẩm mới",
  message: `${product.name} vừa được thêm vào cửa hàng.`,
  severity: "info",
  audience: NOTIFICATION_AUDIENCE.ADMIN,
  targetUrl: `/product/${product._id}`,
  metadata: {
    productId: product._id,
    price: product.salePrice || product.price,
  },
});

export const notifyNewVoucher = async (voucher) => createNotificationService({
  type: NOTIFICATION_TYPES.VOUCHER_NEW,
  title: "Mã giảm giá mới",
  message: `Voucher ${voucher.code} - ${voucher.title} vừa được tạo.`,
  severity: "success",
  audience: NOTIFICATION_AUDIENCE.ALL,
  targetUrl: "/store",
  metadata: {
    voucherId: voucher._id,
    code: voucher.code,
  },
});

export { emitAdminAnalyticsRefresh };
