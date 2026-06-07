import mongoose from "mongoose";
import Order, {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
} from "../models/order.js";
import Review from "../models/review.js";
import User from "../models/user.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const REPORT_TIMEZONE = process.env.REPORT_TIMEZONE || "Asia/Bangkok";

const formatLocalPeriod = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const endOfDay = (date) => {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
};

const parseRange = (query = {}) => {
  const now = new Date();
  const end = query.endDate ? endOfDay(query.endDate) : endOfDay(now);
  let start;

  if (query.startDate) {
    start = startOfDay(query.startDate);
  } else {
    const days = Math.max(1, Math.min(366, parseInt(query.days, 10) || 30));
    start = startOfDay(new Date(end.getTime() - (days - 1) * MS_PER_DAY));
  }

  return { start, end };
};

const dateMatch = (field, start, end) => ({ [field]: { $gte: start, $lte: end } });

const buildPeriodSkeleton = (start, end, groupBy) => {
  if (groupBy === "month") {
    const periods = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cursor <= end) {
      periods.push(`${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`);
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return periods;
  }

  const periods = [];
  const cursor = startOfDay(start);
  while (cursor <= end) {
    periods.push(formatLocalPeriod(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return periods;
};

const mapSeries = (periods, rows, valueFactory) => {
  const rowMap = new Map(rows.map((row) => [row._id, row]));
  return periods.map((period) => ({ period, ...valueFactory(rowMap.get(period)) }));
};

const orderListProjection = {
  orderCode: 1,
  status: 1,
  paymentMethod: 1,
  paymentStatus: 1,
  total: 1,
  createdAt: 1,
  deliveredAt: 1,
  shippingAddress: 1,
  items: 1,
};

export const getAdminStatisticsService = async (query = {}) => {
  const { start, end } = parseRange(query);
  const diffDays = Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY);
  const groupBy = query.groupBy || (diffDays > 92 ? "month" : "day");
  const dateFormat = groupBy === "month" ? "%Y-%m" : "%Y-%m-%d";
  const periods = buildPeriodSkeleton(start, end, groupBy);
  const orderCreatedMatch = dateMatch("createdAt", start, end);
  const deliveredMatch = {
    status: ORDER_STATUS.DELIVERED,
    $or: [
      dateMatch("deliveredAt", start, end),
      { deliveredAt: null, ...dateMatch("updatedAt", start, end) },
    ],
  };

  const [
    orders,
    statusRows,
    revenueRows,
    orderRows,
    customerRows,
    reviewRows,
    topProducts,
    newCustomers,
  ] = await Promise.all([
    Order.find(orderCreatedMatch)
      .populate("user", "name email")
      .select(orderListProjection)
      .sort({ createdAt: -1 })
      .lean(),
    Order.aggregate([
      { $match: orderCreatedMatch },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total: { $sum: "$total" },
          paid: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$total", 0] },
          },
          deliveredRevenue: {
            $sum: { $cond: [{ $eq: ["$status", ORDER_STATUS.DELIVERED] }, "$total", 0] },
          },
        },
      },
    ]),
    Order.aggregate([
      { $match: deliveredMatch },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: { $ifNull: ["$deliveredAt", "$updatedAt"] }, timezone: REPORT_TIMEZONE } },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $match: orderCreatedMatch },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: REPORT_TIMEZONE } },
          orders: { $sum: 1 },
          newOrders: { $sum: { $cond: [{ $eq: ["$status", ORDER_STATUS.NEW] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ["$status", ORDER_STATUS.CANCELLED] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { role: "user", ...dateMatch("createdAt", start, end) } },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: REPORT_TIMEZONE } },
          customers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Review.aggregate([
      { $match: dateMatch("createdAt", start, end) },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt", timezone: REPORT_TIMEZONE } },
          reviews: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $ne: ORDER_STATUS.CANCELLED },
          ...orderCreatedMatch,
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $last: "$items.name" },
          image: { $last: "$items.image" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.total" },
          orderCount: { $addToSet: "$_id" },
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          quantity: 1,
          revenue: 1,
          orderCount: { $size: "$orderCount" },
        },
      },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: 10 },
    ]),
    User.find({ role: "user", ...dateMatch("createdAt", start, end) })
      .select("name email membershipTier createdAt")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
  ]);

  const revenueByPeriod = mapSeries(periods, revenueRows, (row) => ({
    revenue: row?.revenue || 0,
    deliveredOrders: row?.orders || 0,
  }));
  const ordersByPeriod = mapSeries(periods, orderRows, (row) => ({
    orders: row?.orders || 0,
    newOrders: row?.newOrders || 0,
    cancelled: row?.cancelled || 0,
  }));
  const customersByPeriod = mapSeries(periods, customerRows, (row) => ({ customers: row?.customers || 0 }));
  const reviewsByPeriod = mapSeries(periods, reviewRows, (row) => ({ reviews: row?.reviews || 0 }));

  const series = periods.map((period, index) => ({
    period,
    revenue: revenueByPeriod[index].revenue,
    deliveredOrders: revenueByPeriod[index].deliveredOrders,
    orders: ordersByPeriod[index].orders,
    newOrders: ordersByPeriod[index].newOrders,
    cancelled: ordersByPeriod[index].cancelled,
    customers: customersByPeriod[index].customers,
    reviews: reviewsByPeriod[index].reviews,
  }));

  const statusStats = Object.values(ORDER_STATUS).map((status) => {
    const row = statusRows.find((item) => item._id === status);
    return {
      status,
      label: ORDER_STATUS_LABELS[status] || status,
      count: row?.count || 0,
      total: row?.total || 0,
      paid: row?.paid || 0,
      deliveredRevenue: row?.deliveredRevenue || 0,
    };
  });

  const ordersByStatus = Object.values(ORDER_STATUS).reduce((acc, status) => {
    acc[status] = orders
      .filter((order) => order.status === status)
      .slice(0, 10);
    return acc;
  }, {});

  const summary = orders.reduce((acc, order) => {
    const isCancelled = order.status === ORDER_STATUS.CANCELLED;
    if (order.status === ORDER_STATUS.DELIVERED) {
      acc.deliveredOrders += 1;
      acc.walletBalance += order.total;
      acc.revenue += order.total;
    }
    if (!isCancelled && order.paymentStatus === "PAID") acc.collectedMoney += order.total;
    if (!isCancelled && order.status === ORDER_STATUS.SHIPPING) acc.shippingMoney += order.total;
    if (!isCancelled && [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCEL_REQUESTED].includes(order.status)) {
      acc.processingMoney += order.total;
    }
    if (!isCancelled && order.paymentMethod === PAYMENT_METHOD.COD && order.paymentStatus === "UNPAID") acc.codToCollect += order.total;
    if (!isCancelled && order.paymentMethod === PAYMENT_METHOD.MOMO && order.paymentStatus === "PENDING") acc.momoPending += order.total;
    if (order.status === ORDER_STATUS.CANCELLED) acc.cancelledOrders += 1;
    if (order.status === ORDER_STATUS.NEW) acc.newOrders += 1;
    return acc;
  }, {
    totalOrders: orders.length,
    newOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    revenue: 0,
    collectedMoney: 0,
    walletBalance: 0,
    processingMoney: 0,
    shippingMoney: 0,
    codToCollect: 0,
    momoPending: 0,
    newCustomers: newCustomers.length,
  });

  return {
    EC: 0,
    EM: "Lấy thống kê admin thành công",
    DT: {
      range: { start, end, groupBy },
      summary,
      series,
      statusStats,
      ordersByStatus,
      topProducts,
      newCustomers,
      cashFlow: [
        { key: "wallet", label: "Tiền đã vào ví", value: summary.walletBalance, description: "Đơn đã giao thành công" },
        { key: "shipping", label: "Tiền đơn đang giao", value: summary.shippingMoney, description: "Đơn đang trên đường giao" },
        { key: "processing", label: "Tiền đang xử lý", value: summary.processingMoney, description: "Đơn chưa giao/chưa hủy" },
        { key: "cod", label: "COD chờ thu", value: summary.codToCollect, description: "Thu khi giao hàng thành công" },
        { key: "momo", label: "MoMo chờ thanh toán", value: summary.momoPending, description: "Đã tạo link, chưa thu tiền" },
      ],
      labels: {
        orderStatus: ORDER_STATUS_LABELS,
      },
    },
  };
};
