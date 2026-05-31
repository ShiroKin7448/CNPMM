import mongoose from "mongoose";
import Order, { ORDER_STATUS } from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Voucher from "../models/voucher.js";

export const POINT_VALUE = 1000;

export const MEMBERSHIP_TIERS = [
  { key: "MEMBER", label: "Thành viên", minSpent: 0, benefit: "Tích điểm cơ bản" },
  { key: "SILVER", label: "Bạc", minSpent: 30000000, benefit: "Ưu tiên voucher Silver" },
  { key: "GOLD", label: "Vàng", minSpent: 80000000, benefit: "Ưu tiên voucher Gold" },
  { key: "DIAMOND", label: "Kim cương", minSpent: 150000000, benefit: "Đặc quyền cao nhất" },
];

const activeVoucherFilter = (now = new Date()) => ({
  active: true,
  startAt: { $lte: now },
  endAt: { $gte: now },
  $expr: { $lt: ["$usedCount", "$usageLimit"] },
});

const getMembershipTier = (totalSpent = 0) =>
  [...MEMBERSHIP_TIERS].reverse().find((tier) => totalSpent >= tier.minSpent)?.key || "MEMBER";

const calculateVoucherDiscount = (voucher, subtotal) => {
  if (!voucher) return 0;
  const rawDiscount = voucher.discountType === "PERCENT"
    ? Math.floor(subtotal * voucher.value / 100)
    : voucher.value;
  return Math.max(0, Math.min(rawDiscount, voucher.maxDiscount || rawDiscount, subtotal));
};

const decorateVoucher = (voucherInput) => {
  const voucher = typeof voucherInput?.toObject === "function" ? voucherInput.toObject() : voucherInput;
  if (!voucher) return null;
  return {
    ...voucher,
    discountLabel: voucher.discountType === "PERCENT"
      ? `Giảm ${voucher.value}%${voucher.maxDiscount ? `, tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}đ` : ""}`
      : `Giảm ${voucher.value.toLocaleString("vi-VN")}đ`,
  };
};

const getVoucherForUser = async (userId, voucherCode, subtotal) => {
  const code = voucherCode?.toString().trim().toUpperCase();
  if (!code) return { voucher: null, discount: 0 };

  const voucher = await Voucher.findOne({
    code,
    ...activeVoucherFilter(),
    $or: [{ assignedTo: null }, { assignedTo: userId }],
  });
  if (!voucher) return { error: "Mã giảm giá không tồn tại, đã hết hạn hoặc đã hết lượt sử dụng" };
  if (subtotal < voucher.minOrder) {
    return { error: `Đơn hàng cần tối thiểu ${voucher.minOrder.toLocaleString("vi-VN")}đ để dùng mã ${voucher.code}` };
  }

  const usedByUser = await Order.countDocuments({
    user: userId,
    voucherCode: voucher.code,
    status: { $ne: ORDER_STATUS.CANCELLED },
  });
  if (usedByUser >= voucher.maxUsagePerUser) {
    return { error: `Bạn đã dùng hết lượt của mã ${voucher.code}` };
  }

  return { voucher, discount: calculateVoucherDiscount(voucher, subtotal) };
};

export const prepareCheckoutBenefitsService = async (
  userId,
  { voucherCode = "", pointsToUse = 0, subtotal = 0, shippingFee = 0 } = {}
) => {
  const user = await User.findById(userId).select("loyaltyPoints");
  if (!user) return { error: "Không tìm thấy tài khoản" };

  const voucherResult = await getVoucherForUser(userId, voucherCode, subtotal);
  if (voucherResult.error) return voucherResult;

  const voucherDiscount = voucherResult.discount || 0;
  const payableBeforePoints = Math.max(0, subtotal + shippingFee - voucherDiscount);
  const requestedPoints = Math.max(0, Math.floor(Number(pointsToUse) || 0));
  const pointsUsed = Math.min(requestedPoints, user.loyaltyPoints, Math.floor(payableBeforePoints / POINT_VALUE));
  const pointsDiscount = pointsUsed * POINT_VALUE;

  return {
    voucher: voucherResult.voucher,
    voucherCode: voucherResult.voucher?.code || "",
    voucherTitle: voucherResult.voucher?.title || "",
    voucherDiscount,
    pointsUsed,
    pointsDiscount,
    total: Math.max(0, payableBeforePoints - pointsDiscount),
  };
};

export const commitOrderBenefitsService = async (order) => {
  let pointsCommitted = false;
  try {
    if (order.pointsUsed > 0) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: order.user, loyaltyPoints: { $gte: order.pointsUsed } },
        {
          $inc: { loyaltyPoints: -order.pointsUsed },
          $push: {
            loyaltyTransactions: {
              type: "REDEEM",
              points: -order.pointsUsed,
              description: `Dùng điểm cho đơn ${order.orderCode}`,
              reference: order.orderCode,
            },
          },
        },
        { new: true }
      );
      if (!updatedUser) return { ok: false, message: "Kho điểm không còn đủ để áp dụng cho đơn hàng" };
      pointsCommitted = true;
    }

    if (order.voucherCode) {
      const voucher = await Voucher.findOneAndUpdate(
        {
          code: order.voucherCode,
          active: true,
          $expr: { $lt: ["$usedCount", "$usageLimit"] },
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      if (!voucher) {
        if (pointsCommitted) {
          await User.findByIdAndUpdate(order.user, {
            $inc: { loyaltyPoints: order.pointsUsed },
            $push: {
              loyaltyTransactions: {
                type: "REFUND",
                points: order.pointsUsed,
                description: `Hoàn điểm vì mã giảm giá không còn hợp lệ cho đơn ${order.orderCode}`,
                reference: order.orderCode,
              },
            },
          });
        }
        return { ok: false, message: "Mã giảm giá vừa hết lượt sử dụng, vui lòng chọn mã khác" };
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("commitOrderBenefitsService error:", error);
    return { ok: false, message: "Không thể ghi nhận ưu đãi cho đơn hàng" };
  }
};

export const restoreOrderBenefitsService = async (order) => {
  if (!order || order.benefitsRestoredAt) return;

  if (order.pointsUsed > 0) {
    await User.findByIdAndUpdate(order.user, {
      $inc: { loyaltyPoints: order.pointsUsed },
      $push: {
        loyaltyTransactions: {
          type: "REFUND",
          points: order.pointsUsed,
          description: `Hoàn điểm từ đơn ${order.orderCode}`,
          reference: order.orderCode,
        },
      },
    });
  }

  if (order.voucherCode) {
    await Voucher.findOneAndUpdate(
      { code: order.voucherCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }

  order.benefitsRestoredAt = new Date();
  await order.save();
};

export const awardDeliveryLoyaltyService = async (order) => {
  if (!order || order.status !== ORDER_STATUS.DELIVERED || order.loyaltyRewardedAt) return order;

  const points = Math.max(20, Math.floor(order.total / 100000));
  const user = await User.findById(order.user);
  if (user) {
    user.loyaltyPoints += points;
    user.totalSpent += order.total;
    user.membershipTier = getMembershipTier(user.totalSpent);
    user.loyaltyTransactions.push({
      type: "PURCHASE_REWARD",
      points,
      description: `Tích điểm mua hàng từ đơn ${order.orderCode}`,
      reference: order.orderCode,
    });
    await user.save();
  }

  for (const item of order.items) {
    await Product.findOneAndUpdate(
      { _id: item.product, purchasedBy: { $ne: order.user } },
      { $addToSet: { purchasedBy: order.user }, $inc: { buyerCount: 1 } }
    );
  }

  order.loyaltyPointsEarned = points;
  order.loyaltyRewardedAt = new Date();
  await order.save();
  return order;
};

export const awardReviewRewardService = async (userId, reviewIndex) => {
  if (reviewIndex % 2 === 0) {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    const code = `REVIEW-${Date.now().toString().slice(-6)}-${suffix}`;
    const voucher = await Voucher.create({
      code,
      title: "Quà cảm ơn đánh giá",
      description: "Voucher dành riêng cho lần mua tiếp theo sau khi bình luận sản phẩm.",
      discountType: "PERCENT",
      value: 10,
      minOrder: 500000,
      maxDiscount: 500000,
      usageLimit: 1,
      maxUsagePerUser: 1,
      assignedTo: userId,
      source: "REVIEW",
      isPublic: false,
      endAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    return { type: "VOUCHER", voucher: decorateVoucher(voucher), points: 0 };
  }

  const points = 300;
  await User.findByIdAndUpdate(userId, {
    $inc: { loyaltyPoints: points },
    $push: {
      loyaltyTransactions: {
        type: "REVIEW_REWARD",
        points,
        description: "Thưởng điểm sau khi đánh giá sản phẩm đã mua",
        reference: "REVIEW",
      },
    },
  });
  return { type: "POINTS", points, voucher: null };
};

export const getPromotionsService = async (userId = null) => {
  const vouchers = await Voucher.find({
    ...activeVoucherFilter(),
    $or: [
      { isPublic: true, assignedTo: null },
      ...(userId ? [{ assignedTo: userId }] : []),
    ],
  }).sort({ source: 1, createdAt: -1 });
  return { EC: 0, EM: "Lấy danh sách khuyến mãi thành công", DT: vouchers.map(decorateVoucher) };
};

export const getMyStoreService = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -resetPasswordToken -resetPasswordExpires -verificationToken")
    .populate({
      path: "favoriteProducts",
      populate: { path: "category", select: "name slug color icon" },
    })
    .populate({
      path: "recentlyViewed.product",
      populate: { path: "category", select: "name slug color icon" },
    })
    .lean();
  if (!user) return { EC: 1, EM: "Không tìm thấy tài khoản", DT: null };

  const vouchers = await Voucher.find({
    ...activeVoucherFilter(),
    assignedTo: userId,
  }).sort({ createdAt: -1 });

  return {
    EC: 0,
    EM: "Lấy kho thành viên thành công",
    DT: {
      profile: {
        name: user.name,
        email: user.email,
        loyaltyPoints: user.loyaltyPoints || 0,
        pointsValue: (user.loyaltyPoints || 0) * POINT_VALUE,
        totalSpent: user.totalSpent || 0,
        membershipTier: user.membershipTier || "MEMBER",
      },
      tiers: MEMBERSHIP_TIERS,
      pointValue: POINT_VALUE,
      transactions: [...(user.loyaltyTransactions || [])].reverse().slice(0, 20),
      vouchers: vouchers.map(decorateVoucher),
      favorites: user.favoriteProducts || [],
      recentlyViewed: (user.recentlyViewed || []).map((entry) => entry.product).filter(Boolean),
    },
  };
};

export const toggleFavoriteService = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
  const user = await User.findById(userId);
  if (!user) return { EC: 1, EM: "Không tìm thấy tài khoản", DT: null };

  const exists = user.favoriteProducts.some((id) => id.toString() === productId);
  user.favoriteProducts = exists
    ? user.favoriteProducts.filter((id) => id.toString() !== productId)
    : [...user.favoriteProducts, productId];
  await user.save();
  return {
    EC: 0,
    EM: exists ? "Đã bỏ sản phẩm khỏi danh sách yêu thích" : "Đã thêm sản phẩm yêu thích",
    DT: { isFavorite: !exists, count: user.favoriteProducts.length },
  };
};

export const recordRecentlyViewedService = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
  const user = await User.findById(userId);
  if (!user) return { EC: 1, EM: "Không tìm thấy tài khoản", DT: null };

  user.recentlyViewed = [
    { product: productId, viewedAt: new Date() },
    ...user.recentlyViewed.filter((entry) => entry.product.toString() !== productId),
  ].slice(0, 12);
  await user.save();
  return { EC: 0, EM: "Đã ghi nhận sản phẩm vừa xem", DT: null };
};

export const getAdminLoyaltyService = async () => {
  const [vouchers, members] = await Promise.all([
    Voucher.find({}).populate("assignedTo", "name email").sort({ createdAt: -1 }).lean(),
    User.find({ role: "user" })
      .select("name email loyaltyPoints totalSpent membershipTier")
      .sort({ totalSpent: -1 })
      .lean(),
  ]);
  return {
    EC: 0,
    EM: "Lấy dữ liệu thành viên và mã giảm giá thành công",
    DT: {
      vouchers: vouchers.map(decorateVoucher),
      members,
      tiers: MEMBERSHIP_TIERS,
      pointValue: POINT_VALUE,
    },
  };
};

export const createVoucherService = async (data = {}) => {
  try {
    const voucher = await Voucher.create({
      code: data.code?.trim().toUpperCase(),
      title: data.title?.trim(),
      description: data.description?.trim() || "",
      discountType: data.discountType,
      value: Number(data.value),
      minOrder: Number(data.minOrder) || 0,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
      usageLimit: Number(data.usageLimit) || 100,
      maxUsagePerUser: Number(data.maxUsagePerUser) || 1,
      endAt: data.endAt,
      source: "ADMIN",
      isPublic: true,
    });
    return { EC: 0, EM: "Tạo mã giảm giá thành công", DT: decorateVoucher(voucher) };
  } catch (error) {
    console.error("createVoucherService error:", error);
    return { EC: 1, EM: error.code === 11000 ? "Mã giảm giá đã tồn tại" : "Không thể tạo mã giảm giá", DT: null };
  }
};
