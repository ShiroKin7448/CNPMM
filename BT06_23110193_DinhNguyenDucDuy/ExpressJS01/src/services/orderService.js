import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";
import Order, {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
} from "../models/order.js";
import {
  createMomoPayment,
  queryMomoPayment,
  refundMomoPayment,
  verifyMomoResultSignature,
} from "./momoService.js";

const AUTO_CONFIRM_MINUTES = 30;
const AUTO_CONFIRM_MS = AUTO_CONFIRM_MINUTES * 60 * 1000;
const MOMO_PAYMENT_EXPIRE_MINUTES = Math.max(
  1,
  parseInt(process.env.MOMO_PAYMENT_EXPIRE_MINUTES, 10) || 15
);
const MOMO_PAYMENT_EXPIRE_MS = MOMO_PAYMENT_EXPIRE_MINUTES * 60 * 1000;
const MOMO_SWEEP_INTERVAL_MINUTES = Math.max(
  1,
  parseInt(process.env.MOMO_SWEEP_INTERVAL_MINUTES, 10) || 5
);
const MOMO_SWEEP_LIMIT = 50;
const MOMO_MIN_AMOUNT = 1000;
const MOMO_MAX_AMOUNT = 50000000;

const PAYMENT_STATUS_LABELS = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Đang chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUND_PENDING: "Chờ hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
};

const STATUS_TIME_FIELD = {
  [ORDER_STATUS.CONFIRMED]: "confirmedAt",
  [ORDER_STATUS.PREPARING]: "preparingAt",
  [ORDER_STATUS.SHIPPING]: "shippingAt",
  [ORDER_STATUS.DELIVERED]: "deliveredAt",
  [ORDER_STATUS.CANCELLED]: "cancelledAt",
  [ORDER_STATUS.CANCEL_REQUESTED]: "cancelRequestedAt",
};

const ALLOWED_TRANSITIONS = {
  [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CANCEL_REQUESTED]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PREPARING],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.CANCELLED],
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const getUnitPrice = (product) => product.salePrice ?? product.price;
const isBlank = (value) => !value || !value.toString().trim();
const parsePositiveInt = (value, fallback, max = 100) =>
  Math.min(max, Math.max(1, parseInt(value, 10) || fallback));
const numberOrNull = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const createTimelineEntry = (status, note = "", at = new Date()) => ({
  status,
  label: ORDER_STATUS_LABELS[status],
  note,
  at,
});

const createOrderCode = () => {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LS${Date.now()}${random}`;
};

const getCancelDeadline = (order) =>
  new Date(new Date(order.createdAt).getTime() + AUTO_CONFIRM_MS);

const getMomoPaymentExpiresAt = (order) => {
  if (order.paymentInfo?.expiresAt) return new Date(order.paymentInfo.expiresAt);
  return new Date(new Date(order.createdAt).getTime() + MOMO_PAYMENT_EXPIRE_MS);
};

const isMomoPaid = (order) =>
  order.paymentMethod === PAYMENT_METHOD.MOMO && order.paymentStatus === "PAID";

const requiresMomoRefund = (order) =>
  order.paymentMethod === PAYMENT_METHOD.MOMO &&
  ["PAID", "REFUND_PENDING"].includes(order.paymentStatus);

const canFulfillOrder = (order) =>
  order.paymentMethod === PAYMENT_METHOD.COD || order.paymentStatus === "PAID";

const canCancelByTime = (order) =>
  [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED].includes(order.status) &&
  Date.now() <= getCancelDeadline(order).getTime();

const getCancelPolicy = (order) => {
  if (!order || [ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED, ORDER_STATUS.SHIPPING].includes(order.status)) {
    return {
      canCancel: false,
      action: "none",
      title: "Không thể hủy đơn",
      description: "Đơn hàng hiện tại không còn nằm trong trạng thái cho phép hủy.",
    };
  }

  if (isMomoPaid(order) && [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING].includes(order.status)) {
    return {
      canCancel: true,
      action: "request",
      title: "Gửi yêu cầu hủy và hoàn tiền",
      description: "Đơn đã thanh toán qua MoMo nên shop cần duyệt hủy và thực hiện hoàn tiền trên MoMo sandbox.",
    };
  }

  if (order.status === ORDER_STATUS.PREPARING) {
    return {
      canCancel: true,
      action: "request",
      title: "Gửi yêu cầu hủy",
      description: "Shop đang chuẩn bị hàng, yêu cầu hủy cần admin/shop duyệt.",
    };
  }

  if (canCancelByTime(order)) {
    return {
      canCancel: true,
      action: "direct",
      title: "Hủy trực tiếp",
      description: "Đơn chưa thu tiền và còn trong 30 phút đầu, hệ thống sẽ hủy ngay sau khi xác nhận.",
    };
  }

  return {
    canCancel: false,
    action: "none",
    title: "Không thể hủy đơn",
    description: "Sau 30 phút hoặc khi đơn đã sang bước xử lý tiếp theo, người dùng không thể tự hủy đơn.",
  };
};

const decorateOrder = (orderInput) => {
  const order = typeof orderInput.toObject === "function" ? orderInput.toObject() : orderInput;
  const cancelDeadlineAt = getCancelDeadline(order);
  const cancelPolicy = getCancelPolicy(order);

  return {
    ...order,
    statusLabel: ORDER_STATUS_LABELS[order.status] || order.status,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod,
    paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus,
    cancelDeadlineAt,
    autoConfirmMinutes: AUTO_CONFIRM_MINUTES,
    momoPaymentExpireMinutes: MOMO_PAYMENT_EXPIRE_MINUTES,
    momoPaymentExpiresAt: order.paymentMethod === PAYMENT_METHOD.MOMO ? getMomoPaymentExpiresAt(order) : null,
    momoPaymentExpired: order.paymentMethod === PAYMENT_METHOD.MOMO && Date.now() >= getMomoPaymentExpiresAt(order).getTime(),
    cancelPolicy,
    canCancelDirectly: cancelPolicy.action === "direct",
    canRequestCancel: cancelPolicy.action === "request",
  };
};

const autoConfirmOrder = async (order) => {
  if (!order || order.status !== ORDER_STATUS.NEW) return order;
  if (!canFulfillOrder(order)) return order;

  const deadline = getCancelDeadline(order);
  if (Date.now() < deadline.getTime()) return order;

  order.status = ORDER_STATUS.CONFIRMED;
  order.confirmedAt = deadline;
  order.timeline.push(createTimelineEntry(
    ORDER_STATUS.CONFIRMED,
    "Hệ thống tự động xác nhận sau 30 phút.",
    deadline
  ));
  await order.save();
  return order;
};

const restoreStock = async (items = []) => {
  if (!items.length) return;
  await Product.bulkWrite(items.map((item) => ({
    updateOne: {
      filter: { _id: item.product },
      update: {
        $inc: {
          stock: item.quantity,
          sold: -item.quantity,
        },
      },
    },
  })));
};

const restoreCartItems = async (userId, items = []) => {
  if (!userId || !items.length) return;

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId } },
    { returnDocument: "after", upsert: true }
  );

  items.forEach((item) => {
    const productId = item.product.toString();
    const existing = cart.items.find((cartItem) => cartItem.product.toString() === productId);
    if (existing) existing.quantity += item.quantity;
    else cart.items.push({ product: item.product, quantity: item.quantity });
  });

  await cart.save();
};

const reserveStock = async (items = []) => {
  const reserved = [];

  for (const item of items) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, sold: item.quantity } },
      { new: true }
    );

    if (!updatedProduct) {
      await restoreStock(reserved);
      return {
        ok: false,
        message: `${item.name} không còn đủ ${item.quantity} sản phẩm trong kho`,
      };
    }

    reserved.push(item);
  }

  return { ok: true };
};

const validateShippingAddress = (shippingAddress = {}) => {
  if (isBlank(shippingAddress.fullName)) return "Vui lòng nhập họ tên người nhận";
  if (isBlank(shippingAddress.phone)) return "Vui lòng nhập số điện thoại";
  if (isBlank(shippingAddress.address)) return "Vui lòng nhập địa chỉ giao hàng";
  return "";
};

const normalizeSelectedProductIds = (selectedProductIds) => {
  if (!Array.isArray(selectedProductIds)) return null;
  return selectedProductIds
    .map((id) => id?.toString())
    .filter((id) => id && isValidObjectId(id));
};

const normalizePaymentMethod = (paymentMethod) => {
  const method = paymentMethod || PAYMENT_METHOD.COD;
  if (![PAYMENT_METHOD.COD, PAYMENT_METHOD.MOMO].includes(method)) {
    return { error: "Chỉ hỗ trợ thanh toán COD hoặc MoMo sandbox" };
  }
  return { method };
};

const buildMomoItems = (orderItems) =>
  orderItems.slice(0, 50).map((item) => ({
    id: item.product.toString(),
    name: item.name.slice(0, 120),
    description: item.name.slice(0, 255),
    category: "laptop",
    imageUrl: item.image || "",
    manufacturer: "LaptopStore",
    price: Math.round(item.price),
    currency: "VND",
    quantity: item.quantity,
    unit: "cái",
    totalPrice: Math.round(item.total),
    taxAmount: 0,
  }));

const markMomoCreateFailed = async (order, message) => {
  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = new Date();
  order.cancelReason = message || "Không tạo được giao dịch MoMo sandbox.";
  order.paymentStatus = "FAILED";
  order.paymentInfo = {
    ...(order.paymentInfo || {}),
    provider: PAYMENT_METHOD.MOMO,
    message: message || "",
  };
  order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, order.cancelReason));
  await order.save();
  await restoreStock(order.items);
};

const applyFailedMomoResult = async (order, payload, note) => {
  order.paymentStatus = "FAILED";
  order.paymentInfo = {
    ...(order.paymentInfo || {}),
    provider: PAYMENT_METHOD.MOMO,
    transId: payload.transId?.toString() || order.paymentInfo?.transId || "",
    payType: payload.payType || order.paymentInfo?.payType || "",
    resultCode: numberOrNull(payload.resultCode),
    message: payload.message || "",
    responseTime: numberOrNull(payload.responseTime) ?? order.paymentInfo?.responseTime ?? null,
  };

  if (order.status !== ORDER_STATUS.CANCELLED) {
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = note;
    order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, note));
    await restoreStock(order.items);
  } else {
    order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, note));
  }

  await order.save();
  return order;
};

const applyPaidMomoResult = async (order, payload) => {
  const paidAmount = Number(payload.amount);
  if (paidAmount !== Math.round(order.total)) {
    order.timeline.push(createTimelineEntry(
      order.status,
      `MoMo trả về số tiền ${paidAmount.toLocaleString("vi-VN")} VND không khớp tổng đơn ${Math.round(order.total).toLocaleString("vi-VN")} VND.`
    ));
    await order.save();
    return { EC: 1, EM: "Số tiền MoMo trả về không khớp đơn hàng", DT: decorateOrder(order) };
  }

  const incomingTransId = payload.transId?.toString() || "";
  if (order.paymentStatus === "PAID" && (!incomingTransId || incomingTransId === order.paymentInfo?.transId)) {
    return { EC: 0, EM: "Đơn đã được xác nhận thanh toán MoMo", DT: decorateOrder(order) };
  }

  order.paymentInfo = {
    ...(order.paymentInfo || {}),
    provider: PAYMENT_METHOD.MOMO,
    momoOrderId: payload.orderId || order.paymentInfo?.momoOrderId || order.orderCode,
    requestId: payload.requestId || order.paymentInfo?.requestId || "",
    transId: incomingTransId || order.paymentInfo?.transId || "",
    payType: payload.payType || order.paymentInfo?.payType || "",
    resultCode: numberOrNull(payload.resultCode),
    message: payload.message || "Successful.",
    responseTime: numberOrNull(payload.responseTime) ?? order.paymentInfo?.responseTime ?? null,
    paidAt: order.paymentInfo?.paidAt || new Date(),
  };

  if (order.status === ORDER_STATUS.CANCELLED) {
    order.paymentStatus = "REFUND_PENDING";
    order.timeline.push(createTimelineEntry(
      ORDER_STATUS.CANCELLED,
      "MoMo báo thanh toán thành công sau khi đơn đã hủy. Cần admin hoàn tiền thủ công qua MoMo."
    ));
  } else {
    order.paymentStatus = "PAID";
    order.timeline.push(createTimelineEntry(
      order.status,
      `MoMo sandbox xác nhận đã thu ${Math.round(order.total).toLocaleString("vi-VN")} VND.`
    ));
  }

  await order.save();
  return { EC: 0, EM: "Xác nhận thanh toán MoMo thành công", DT: decorateOrder(order) };
};

const applyMomoResultToOrder = async (order, payload) => {
  if (!order) return { EC: 1, EM: "Không tìm thấy đơn hàng MoMo", DT: null };
  if (order.paymentMethod !== PAYMENT_METHOD.MOMO) {
    return { EC: 1, EM: "Đơn hàng không dùng MoMo", DT: decorateOrder(order) };
  }

  const resultCode = Number(payload.resultCode);
  if (!Number.isFinite(resultCode)) {
    return { EC: 1, EM: "MoMo không trả về mã trạng thái hợp lệ", DT: decorateOrder(order) };
  }
  if (resultCode === 0) return applyPaidMomoResult(order, payload);

  if ([1000, 7000, 7002, 9000].includes(resultCode) && order.paymentStatus === "PENDING") {
    order.paymentInfo = {
      ...(order.paymentInfo || {}),
      provider: PAYMENT_METHOD.MOMO,
      resultCode,
      message: payload.message || order.paymentInfo?.message || "",
      responseTime: numberOrNull(payload.responseTime) ?? order.paymentInfo?.responseTime ?? null,
    };
    order.timeline.push(createTimelineEntry(order.status, payload.message || "MoMo vẫn đang chờ xử lý giao dịch."));
    await order.save();
    return { EC: 0, EM: "MoMo vẫn đang chờ người dùng xác nhận thanh toán", DT: decorateOrder(order) };
  }

  if (order.paymentStatus === "PAID" || order.paymentStatus === "REFUNDED") {
    return { EC: 0, EM: "Đơn đã có trạng thái thanh toán cuối cùng", DT: decorateOrder(order) };
  }

  const note = payload.message
    ? `Thanh toán MoMo không thành công: ${payload.message}`
    : "Thanh toán MoMo không thành công.";
  const updated = await applyFailedMomoResult(order, payload, note);
  return { EC: 0, EM: "Đã ghi nhận thanh toán MoMo không thành công", DT: decorateOrder(updated) };
};

const buildMomoResultPayloadFromQuery = (order, data = {}) => ({
  ...data,
  orderId: data.orderId || order.paymentInfo?.momoOrderId || order.orderCode,
  requestId: data.requestId || order.paymentInfo?.requestId || "",
  amount: data.amount ?? order.total,
  extraData: data.extraData || "",
  orderInfo: data.orderInfo || `Thanh toán đơn ${order.orderCode}`,
  orderType: data.orderType || "momo_wallet",
  payType: data.payType || "",
  responseTime: data.responseTime || Date.now(),
  transId: data.transId || "",
  message: data.message || "",
  resultCode: data.resultCode,
});

const expirePendingMomoOrder = async (order) => {
  if (!order || order.paymentMethod !== PAYMENT_METHOD.MOMO || order.paymentStatus !== "PENDING") {
    return order;
  }

  const expiresAt = getMomoPaymentExpiresAt(order);
  if (Date.now() < expiresAt.getTime()) return order;

  const queryResult = await queryMomoPayment({
    momoOrderId: order.paymentInfo?.momoOrderId || order.orderCode,
    requestId: order.paymentInfo?.requestId || `${order.orderCode}RQ`,
  });
  const queryData = queryResult.data || {};
  const queryCode = numberOrNull(queryData.resultCode);

  if (queryResult.ok && queryCode === 0) {
    await applyMomoResultToOrder(order, buildMomoResultPayloadFromQuery(order, queryData));
    return order;
  }

  if (queryResult.ok && queryCode !== null && ![1000, 7000, 7002, 9000].includes(queryCode)) {
    await applyMomoResultToOrder(order, buildMomoResultPayloadFromQuery(order, queryData));
    return order;
  }

  const now = new Date();
  const note = `Quá hạn thanh toán MoMo sau ${MOMO_PAYMENT_EXPIRE_MINUTES} phút. Hệ thống tự hủy đơn, hoàn kho và đưa sản phẩm về lại giỏ hàng.`;

  order.status = ORDER_STATUS.CANCELLED;
  order.cancelledAt = order.cancelledAt || now;
  order.cancelReason = note;
  order.paymentStatus = "FAILED";
  order.paymentInfo = {
    ...(order.paymentInfo || {}),
    provider: PAYMENT_METHOD.MOMO,
    expiresAt,
    expiredAt: now,
    resultCode: queryCode,
    message: queryData.message || "Hết hạn thanh toán nội bộ.",
    responseTime: numberOrNull(queryData.responseTime) ?? order.paymentInfo?.responseTime ?? null,
  };
  order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, note, now));

  await order.save();
  await restoreStock(order.items);
  await restoreCartItems(order.user, order.items);

  order.paymentInfo.cartRestoredAt = now;
  await order.save();
  return order;
};

const refreshOrderLifecycle = async (order) => {
  const expiredOrCurrent = await expirePendingMomoOrder(order);
  if (expiredOrCurrent?.status === ORDER_STATUS.CANCELLED) return expiredOrCurrent;
  return autoConfirmOrder(expiredOrCurrent);
};

const findMomoOrder = async (payload = {}, userId = null) => {
  const conditions = [
    payload.orderId ? { orderCode: payload.orderId } : null,
    payload.orderId ? { "paymentInfo.momoOrderId": payload.orderId } : null,
    payload.requestId ? { "paymentInfo.requestId": payload.requestId } : null,
  ].filter(Boolean);

  if (!conditions.length) return null;

  const filter = {
    paymentMethod: PAYMENT_METHOD.MOMO,
    $or: conditions,
  };
  if (userId) filter.user = userId;
  return Order.findOne(filter);
};

const refundPaidMomoOrder = async (order, note) => {
  const transId = order.paymentInfo?.transId;
  if (!transId) {
    return {
      ok: false,
      message: "Đơn MoMo đã thanh toán nhưng chưa có mã giao dịch MoMo để hoàn tiền",
    };
  }

  const description = note || `Hoàn tiền đơn ${order.orderCode}`;
  const refundResult = await refundMomoPayment({
    orderCode: order.orderCode,
    amount: Math.round(order.total),
    transId,
    description,
  });

  const data = refundResult.data || {};
  order.paymentInfo = {
    ...(order.paymentInfo || {}),
    refundOrderId: refundResult.orderId,
    refundRequestId: refundResult.requestId,
    refundTransId: data.transId?.toString() || "",
    refundResultCode: numberOrNull(data.resultCode),
    refundMessage: data.message || "",
  };

  if (!refundResult.ok || Number(data.resultCode) !== 0) {
    await order.save();
    return {
      ok: false,
      message: data.message || "MoMo sandbox từ chối hoàn tiền",
    };
  }

  order.paymentStatus = "REFUNDED";
  order.paymentInfo.refundedAt = new Date();
  return { ok: true };
};

export const checkoutService = async (userId, payload = {}) => {
  let reservedItems = [];

  try {
    const addressError = validateShippingAddress(payload.shippingAddress);
    if (addressError) return { EC: 1, EM: addressError, DT: null };

    const payment = normalizePaymentMethod(payload.paymentMethod);
    if (payment.error) return { EC: 1, EM: payment.error, DT: null };

    const hasSelection = Array.isArray(payload.selectedProductIds);
    const selectedIds = normalizeSelectedProductIds(payload.selectedProductIds);
    if (hasSelection && !selectedIds.length) {
      return { EC: 1, EM: "Vui lòng chọn ít nhất một sản phẩm để thanh toán", DT: null };
    }
    const selectedSet = selectedIds ? new Set(selectedIds) : null;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product", "name price salePrice images stock isActive")
      .lean();

    const validItems = (cart?.items || [])
      .filter((item) => item.product && item.product.isActive !== false)
      .filter((item) => !selectedSet || selectedSet.has(item.product._id.toString()));

    if (!validItems.length) {
      return {
        EC: 1,
        EM: selectedSet ? "Không tìm thấy sản phẩm đã chọn trong giỏ hàng" : "Giỏ hàng đang trống",
        DT: null,
      };
    }

    for (const item of validItems) {
      if (item.quantity > item.product.stock) {
        return {
          EC: 1,
          EM: `${item.product.name} chỉ còn ${item.product.stock} sản phẩm trong kho`,
          DT: null,
        };
      }
    }

    const orderItems = validItems.map((item) => {
      const unitPrice = Math.round(getUnitPrice(item.product));
      return {
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0] || "",
        price: unitPrice,
        quantity: item.quantity,
        total: unitPrice * item.quantity,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const shippingFee = subtotal >= 20000000 ? 0 : 30000;
    const total = Math.round(subtotal + shippingFee);

    if (payment.method === PAYMENT_METHOD.MOMO && (total < MOMO_MIN_AMOUNT || total > MOMO_MAX_AMOUNT)) {
      return {
        EC: 1,
        EM: `MoMo sandbox chỉ nhận đơn từ ${MOMO_MIN_AMOUNT.toLocaleString("vi-VN")} đến ${MOMO_MAX_AMOUNT.toLocaleString("vi-VN")} VND`,
        DT: null,
      };
    }

    const reserveResult = await reserveStock(orderItems);
    if (!reserveResult.ok) return { EC: 1, EM: reserveResult.message, DT: null };
    reservedItems = orderItems;

    const shippingAddress = {
      fullName: payload.shippingAddress.fullName.trim(),
      phone: payload.shippingAddress.phone.trim(),
      address: payload.shippingAddress.address.trim(),
      note: payload.shippingAddress.note?.trim() || "",
    };

    const isMomo = payment.method === PAYMENT_METHOD.MOMO;
    const momoPaymentExpiresAt = isMomo ? new Date(Date.now() + MOMO_PAYMENT_EXPIRE_MS) : null;
    const order = await Order.create({
      user: userId,
      orderCode: createOrderCode(),
      items: orderItems,
      shippingAddress,
      paymentMethod: payment.method,
      paymentStatus: isMomo ? "PENDING" : "UNPAID",
      paymentInfo: { provider: payment.method, expiresAt: momoPaymentExpiresAt },
      subtotal,
      shippingFee,
      total,
      status: ORDER_STATUS.NEW,
      timeline: [
        createTimelineEntry(ORDER_STATUS.NEW, "Đơn hàng đã được đặt thành công."),
        createTimelineEntry(
          ORDER_STATUS.NEW,
          isMomo
            ? "Đơn đang chờ khách hoàn tất thanh toán MoMo sandbox."
            : "Đơn hàng sẽ được thanh toán khi nhận hàng."
        ),
      ],
    });

    if (isMomo) {
      const momoResult = await createMomoPayment({
        orderCode: order.orderCode,
        amount: total,
        orderInfo: `Thanh toán đơn ${order.orderCode}`,
        items: buildMomoItems(orderItems),
        shippingAddress: { ...shippingAddress, shippingFee },
      });

      const momoData = momoResult.data || {};
      order.paymentInfo = {
        provider: PAYMENT_METHOD.MOMO,
        momoOrderId: momoData.orderId || order.orderCode,
        requestId: momoData.requestId || `${order.orderCode}RQ`,
        payUrl: momoData.payUrl || "",
        deeplink: momoData.deeplink || "",
        qrCodeUrl: momoData.qrCodeUrl || "",
        resultCode: numberOrNull(momoData.resultCode),
        message: momoData.message || "",
        responseTime: numberOrNull(momoData.responseTime),
        expiresAt: momoPaymentExpiresAt,
      };

      if (!momoResult.ok || Number(momoData.resultCode) !== 0 || !momoData.payUrl) {
        await markMomoCreateFailed(order, momoData.message || "Không tạo được link thanh toán MoMo sandbox.");
        reservedItems = [];
        return { EC: 1, EM: momoData.message || "Không tạo được link thanh toán MoMo sandbox", DT: null };
      }

      order.timeline.push(createTimelineEntry(ORDER_STATUS.NEW, "Đã tạo link thanh toán MoMo sandbox, chờ khách thanh toán."));
      await order.save();
    }

    await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: { $in: orderItems.map((item) => item.product) } } } }
    );
    reservedItems = [];

    return {
      EC: 0,
      EM: isMomo
        ? "Đã tạo yêu cầu thanh toán MoMo sandbox"
        : "Đặt hàng COD thành công",
      DT: decorateOrder(order),
    };
  } catch (error) {
    if (reservedItems.length) await restoreStock(reservedItems);
    console.error("checkoutService error:", error);
    return { EC: -1, EM: "Lỗi server khi thanh toán đơn hàng", DT: null };
  }
};

export const getOrdersService = async (userId) => {
  try {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
    const refreshed = await Promise.all(orders.map(refreshOrderLifecycle));
    return {
      EC: 0,
      EM: "Lấy lịch sử đơn hàng thành công",
      DT: refreshed.map(decorateOrder),
    };
  } catch (error) {
    console.error("getOrdersService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy đơn hàng", DT: null };
  }
};

export const getOrderDetailService = async (userId, orderId) => {
  try {
    if (!isValidObjectId(orderId)) return { EC: 1, EM: "Đơn hàng không hợp lệ", DT: null };
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { EC: 1, EM: "Không tìm thấy đơn hàng", DT: null };
    const refreshed = await refreshOrderLifecycle(order);
    return { EC: 0, EM: "Lấy chi tiết đơn hàng thành công", DT: decorateOrder(refreshed) };
  } catch (error) {
    console.error("getOrderDetailService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy chi tiết đơn hàng", DT: null };
  }
};

export const cancelOrderService = async (userId, orderId, reason = "") => {
  try {
    if (!isValidObjectId(orderId)) return { EC: 1, EM: "Đơn hàng không hợp lệ", DT: null };

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { EC: 1, EM: "Không tìm thấy đơn hàng", DT: null };
    await refreshOrderLifecycle(order);

    const policy = getCancelPolicy(order);
    const note = reason?.trim() || "Khách hàng muốn hủy đơn.";

    if (policy.action === "direct") {
      order.status = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelReason = note;
      if (order.paymentMethod === PAYMENT_METHOD.MOMO) order.paymentStatus = "FAILED";
      order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, `Khách hàng hủy trực tiếp: ${note}`));
      await order.save();
      await restoreStock(order.items);
      if (order.paymentMethod === PAYMENT_METHOD.MOMO) {
        await restoreCartItems(order.user, order.items);
        order.paymentInfo = {
          ...(order.paymentInfo || {}),
          cartRestoredAt: new Date(),
        };
        await order.save();
      }

      return {
        EC: 0,
        EM: "Đã hủy đơn hàng trong thời gian cho phép",
        DT: { ...decorateOrder(order), cancelAction: "direct" },
      };
    }

    if (policy.action === "request") {
      order.cancelRequestFromStatus = order.status;
      order.status = ORDER_STATUS.CANCEL_REQUESTED;
      order.cancelRequestedAt = new Date();
      order.cancelReason = note;
      order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCEL_REQUESTED, `Khách hàng gửi yêu cầu hủy: ${note}`));
      await order.save();

      return {
        EC: 0,
        EM: "Đã gửi yêu cầu hủy đơn cho shop duyệt",
        DT: { ...decorateOrder(order), cancelAction: "request" },
      };
    }

    return {
      EC: 1,
      EM: policy.description,
      DT: decorateOrder(order),
    };
  } catch (error) {
    console.error("cancelOrderService error:", error);
    return { EC: -1, EM: "Lỗi server khi hủy đơn hàng", DT: null };
  }
};

export const updateOrderStatusService = async (orderId, nextStatus, note = "") => {
  try {
    if (!isValidObjectId(orderId)) return { EC: 1, EM: "Đơn hàng không hợp lệ", DT: null };
    if (!Object.values(ORDER_STATUS).includes(nextStatus)) {
      return { EC: 1, EM: "Trạng thái đơn hàng không hợp lệ", DT: null };
    }

    const order = await Order.findById(orderId);
    if (!order) return { EC: 1, EM: "Không tìm thấy đơn hàng", DT: null };
    await refreshOrderLifecycle(order);

    const allowed = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return {
        EC: 1,
        EM: `Không thể chuyển từ "${ORDER_STATUS_LABELS[order.status]}" sang "${ORDER_STATUS_LABELS[nextStatus]}"`,
        DT: decorateOrder(order),
      };
    }

    if ([ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING].includes(nextStatus) && !canFulfillOrder(order)) {
      return {
        EC: 1,
        EM: "Đơn MoMo chưa thanh toán thành công nên không thể chuyển sang bước xử lý/giao hàng",
        DT: decorateOrder(order),
      };
    }

    const statusNote = note?.trim();

    if (order.status === ORDER_STATUS.CANCELLED && nextStatus === ORDER_STATUS.CANCELLED && !requiresMomoRefund(order)) {
      return { EC: 1, EM: "Đơn đã hủy và không còn thao tác cần xử lý", DT: decorateOrder(order) };
    }

    if (nextStatus === ORDER_STATUS.CANCELLED) {
      const wasCancelled = order.status === ORDER_STATUS.CANCELLED;

      if (requiresMomoRefund(order)) {
        const refund = await refundPaidMomoOrder(order, statusNote || `Hủy và hoàn tiền đơn ${order.orderCode}`);
        if (!refund.ok) {
          order.paymentStatus = "REFUND_PENDING";
          order.timeline.push(createTimelineEntry(
            order.status,
            `Chưa thể hủy đơn vì hoàn tiền MoMo chưa thành công: ${refund.message}`
          ));
          await order.save();
          return {
            EC: 1,
            EM: refund.message,
            DT: decorateOrder(order),
          };
        }
      } else if (order.paymentMethod === PAYMENT_METHOD.MOMO && order.paymentStatus === "PENDING") {
        order.paymentStatus = "FAILED";
      }

      if (!wasCancelled) await restoreStock(order.items);
      order.cancelledAt = order.cancelledAt || new Date();
      order.cancelReason = statusNote || order.cancelReason || "Shop hủy/xác nhận hủy đơn.";
    }

    let finalStatus = nextStatus;
    if (order.status === ORDER_STATUS.CANCEL_REQUESTED && nextStatus === ORDER_STATUS.PREPARING) {
      finalStatus = order.cancelRequestFromStatus || ORDER_STATUS.PREPARING;
      order.timeline.push(createTimelineEntry(
        finalStatus,
        statusNote || "Shop từ chối yêu cầu hủy và tiếp tục xử lý đơn hàng."
      ));
      order.cancelRequestFromStatus = "";
    } else {
      order.timeline.push(createTimelineEntry(
        nextStatus,
        statusNote || `Cập nhật trạng thái: ${ORDER_STATUS_LABELS[nextStatus]}`
      ));
    }

    order.status = finalStatus;
    const timeField = STATUS_TIME_FIELD[finalStatus];
    if (timeField) order[timeField] = order[timeField] || new Date();

    if (nextStatus === ORDER_STATUS.DELIVERED && order.paymentMethod === PAYMENT_METHOD.COD) {
      order.paymentStatus = "PAID";
      order.paymentInfo = {
        ...(order.paymentInfo || {}),
        provider: PAYMENT_METHOD.COD,
        paidAt: order.paymentInfo?.paidAt || new Date(),
        message: "Đã thu tiền COD khi giao hàng thành công.",
      };
    }

    await order.save();
    return { EC: 0, EM: "Cập nhật trạng thái đơn hàng thành công", DT: decorateOrder(order) };
  } catch (error) {
    console.error("updateOrderStatusService error:", error);
    return { EC: -1, EM: "Lỗi server khi cập nhật trạng thái", DT: null };
  }
};

export const handleMomoReturnService = async (userId, payload = {}) => {
  try {
    if (!verifyMomoResultSignature(payload)) {
      return { EC: 1, EM: "Chữ ký MoMo không hợp lệ", DT: null };
    }

    const order = await findMomoOrder(payload, userId);
    const result = await applyMomoResultToOrder(order, payload);
    return result;
  } catch (error) {
    console.error("handleMomoReturnService error:", error);
    return { EC: -1, EM: "Lỗi server khi xử lý kết quả MoMo", DT: null };
  }
};

export const handleMomoIpnService = async (payload = {}) => {
  try {
    if (!verifyMomoResultSignature(payload)) {
      return { EC: 1, EM: "Chữ ký IPN MoMo không hợp lệ", DT: null };
    }

    const order = await findMomoOrder(payload);
    const result = await applyMomoResultToOrder(order, payload);
    return result;
  } catch (error) {
    console.error("handleMomoIpnService error:", error);
    return { EC: -1, EM: "Lỗi server khi xử lý IPN MoMo", DT: null };
  }
};

export const syncMomoPaymentService = async (userId, orderId) => {
  try {
    if (!isValidObjectId(orderId)) return { EC: 1, EM: "Đơn hàng không hợp lệ", DT: null };

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { EC: 1, EM: "Không tìm thấy đơn hàng", DT: null };
    await expirePendingMomoOrder(order);
    if (order.paymentMethod !== PAYMENT_METHOD.MOMO) {
      return { EC: 1, EM: "Đơn hàng không dùng MoMo", DT: decorateOrder(order) };
    }
    if (!["PENDING", "FAILED"].includes(order.paymentStatus)) {
      return { EC: 0, EM: "Đơn đã có trạng thái thanh toán cuối cùng", DT: decorateOrder(order) };
    }

    const queryResult = await queryMomoPayment({
      momoOrderId: order.paymentInfo?.momoOrderId || order.orderCode,
      requestId: order.paymentInfo?.requestId || `${order.orderCode}RQ`,
    });

    const data = queryResult.data || {};
    if (!queryResult.ok) {
      return { EC: 1, EM: data.message || "Không kiểm tra được trạng thái MoMo", DT: decorateOrder(order) };
    }
    if (data.resultCode === undefined || data.resultCode === null) {
      return { EC: 1, EM: data.message || "MoMo không trả về mã trạng thái giao dịch", DT: decorateOrder(order) };
    }

    const result = await applyMomoResultToOrder(order, buildMomoResultPayloadFromQuery(order, data));
    return result;
  } catch (error) {
    console.error("syncMomoPaymentService error:", error);
    return { EC: -1, EM: "Lỗi server khi kiểm tra MoMo", DT: null };
  }
};

export const sweepExpiredMomoPaymentsService = async () => {
  try {
    const now = new Date();
    const cutoff = new Date(Date.now() - MOMO_PAYMENT_EXPIRE_MS);
    const orders = await Order.find({
      paymentMethod: PAYMENT_METHOD.MOMO,
      paymentStatus: "PENDING",
      $or: [
        { "paymentInfo.expiresAt": { $lte: now } },
        { createdAt: { $lte: cutoff } },
      ],
    }).limit(MOMO_SWEEP_LIMIT);

    if (!orders.length) return { EC: 0, EM: "Không có đơn MoMo quá hạn", DT: { scanned: 0, expired: 0 } };

    let expired = 0;
    for (const order of orders) {
      const beforeStatus = order.paymentStatus;
      const beforeOrderStatus = order.status;
      await expirePendingMomoOrder(order);
      if (beforeStatus !== order.paymentStatus || beforeOrderStatus !== order.status) expired += 1;
    }

    return { EC: 0, EM: "Đã quét đơn MoMo quá hạn", DT: { scanned: orders.length, expired } };
  } catch (error) {
    console.error("sweepExpiredMomoPaymentsService error:", error);
    return { EC: -1, EM: "Lỗi server khi quét đơn MoMo quá hạn", DT: null };
  }
};

export const startMomoPendingPaymentSweeper = () => {
  if (process.env.MOMO_SWEEP_ENABLED === "false") return;

  let running = false;
  const run = async () => {
    if (running) return;
    running = true;
    try {
      await sweepExpiredMomoPaymentsService();
    } finally {
      running = false;
    }
  };

  setTimeout(run, 10000);
  setInterval(run, MOMO_SWEEP_INTERVAL_MINUTES * 60 * 1000);
};

export const getAdminOrdersService = async (query = {}) => {
  try {
    const page = parsePositiveInt(query.page, 1);
    const limit = parsePositiveInt(query.limit, 12, 50);
    const skip = (page - 1) * limit;
    const filter = {};

    if (query.status && Object.values(ORDER_STATUS).includes(query.status)) filter.status = query.status;
    if (query.paymentMethod && Object.values(PAYMENT_METHOD).includes(query.paymentMethod)) filter.paymentMethod = query.paymentMethod;
    if (query.paymentStatus && PAYMENT_STATUS_LABELS[query.paymentStatus]) filter.paymentStatus = query.paymentStatus;

    const search = query.search?.toString().trim();
    if (search) {
      const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { orderCode: { $regex: pattern, $options: "i" } },
        { "shippingAddress.fullName": { $regex: pattern, $options: "i" } },
        { "shippingAddress.phone": { $regex: pattern, $options: "i" } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    const refreshed = await Promise.all(orders.map(refreshOrderLifecycle));
    return {
      EC: 0,
      EM: "Lấy danh sách đơn hàng admin thành công",
      DT: {
        orders: refreshed.map(decorateOrder),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("getAdminOrdersService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy đơn hàng admin", DT: null };
  }
};

export const getAdminDashboardService = async () => {
  try {
    const orders = await Order.find({}).populate("user", "name email role").sort({ createdAt: -1 });
    const refreshedOrders = await Promise.all(orders.map(refreshOrderLifecycle));
    const products = await Product.find({ isActive: true }).select("name stock sold price salePrice images brand").lean();
    const lowStockProducts = products
      .filter((product) => product.stock <= 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8);

    const statusCounts = Object.values(ORDER_STATUS).reduce((acc, status) => ({ ...acc, [status]: 0 }), {});
    let collectedRevenue = 0;
    let recognizedRevenue = 0;
    let pendingCOD = 0;
    let momoPending = 0;
    let refundPending = 0;
    let refundedAmount = 0;

    refreshedOrders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;

      if (order.status === ORDER_STATUS.DELIVERED) recognizedRevenue += order.total;

      const isCancelled = order.status === ORDER_STATUS.CANCELLED;
      if (!isCancelled && order.paymentStatus === "PAID") collectedRevenue += order.total;

      if (order.paymentMethod === PAYMENT_METHOD.COD && order.paymentStatus === "UNPAID" && !isCancelled) {
        pendingCOD += order.total;
      }
      if (order.paymentMethod === PAYMENT_METHOD.MOMO && order.paymentStatus === "PENDING" && !isCancelled) {
        momoPending += order.total;
      }
      if (order.paymentStatus === "REFUND_PENDING" || (order.status === ORDER_STATUS.CANCEL_REQUESTED && isMomoPaid(order))) {
        refundPending += order.total;
      }
      if (order.paymentStatus === "REFUNDED") refundedAmount += order.total;
    });

    const inventoryValue = products.reduce(
      (sum, product) => sum + product.stock * getUnitPrice(product),
      0
    );

    return {
      EC: 0,
      EM: "Lấy dashboard admin thành công",
      DT: {
        totals: {
          orders: refreshedOrders.length,
          products: products.length,
          paidRevenue: collectedRevenue,
          collectedRevenue,
          deliveredRevenue: recognizedRevenue,
          recognizedRevenue,
          pendingCOD,
          momoPending,
          refundPending,
          refundedAmount,
          inventoryValue,
          lowStock: lowStockProducts.length,
          cancelRequests: statusCounts[ORDER_STATUS.CANCEL_REQUESTED] || 0,
        },
        statusCounts,
        lowStockProducts,
        recentOrders: refreshedOrders.slice(0, 6).map(decorateOrder),
        labels: {
          orderStatus: ORDER_STATUS_LABELS,
          paymentMethod: PAYMENT_METHOD_LABELS,
          paymentStatus: PAYMENT_STATUS_LABELS,
        },
      },
    };
  } catch (error) {
    console.error("getAdminDashboardService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy dashboard admin", DT: null };
  }
};

export {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  AUTO_CONFIRM_MINUTES,
};
