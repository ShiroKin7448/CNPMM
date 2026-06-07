import mongoose from "mongoose";
import Order, { ORDER_STATUS } from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import Voucher from "../models/voucher.js";
import { notifyNewVoucher } from "./notificationService.js";

export const POINT_VALUE = 1000;
const runNotification = (promise) => {
  if (promise?.catch) promise.catch((error) => console.error("notification error:", error));
};

export const MEMBERSHIP_TIERS = [
  { key: "MEMBER", label: "ThÃ nh viÃªn", minSpent: 0, benefit: "TÃ­ch Ä‘iá»ƒm cÆ¡ báº£n" },
  { key: "SILVER", label: "Báº¡c", minSpent: 30000000, benefit: "Æ¯u tiÃªn voucher Silver" },
  { key: "GOLD", label: "VÃ ng", minSpent: 80000000, benefit: "Æ¯u tiÃªn voucher Gold" },
  { key: "DIAMOND", label: "Kim cÆ°Æ¡ng", minSpent: 150000000, benefit: "Äáº·c quyá»n cao nháº¥t" },
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
      ? `Giáº£m ${voucher.value}%${voucher.maxDiscount ? `, tá»‘i Ä‘a ${voucher.maxDiscount.toLocaleString("vi-VN")}Ä‘` : ""}`
      : `Giáº£m ${voucher.value.toLocaleString("vi-VN")}Ä‘`,
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
  if (!voucher) return { error: "MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i, Ä‘Ã£ háº¿t háº¡n hoáº·c Ä‘Ã£ háº¿t lÆ°á»£t sá»­ dá»¥ng" };
  if (subtotal < voucher.minOrder) {
    return { error: `ÄÆ¡n hÃ ng cáº§n tá»‘i thiá»ƒu ${voucher.minOrder.toLocaleString("vi-VN")}Ä‘ Ä‘á»ƒ dÃ¹ng mÃ£ ${voucher.code}` };
  }

  const usedByUser = await Order.countDocuments({
    user: userId,
    voucherCode: voucher.code,
    status: { $ne: ORDER_STATUS.CANCELLED },
  });
  if (usedByUser >= voucher.maxUsagePerUser) {
    return { error: `Báº¡n Ä‘Ã£ dÃ¹ng háº¿t lÆ°á»£t cá»§a mÃ£ ${voucher.code}` };
  }

  return { voucher, discount: calculateVoucherDiscount(voucher, subtotal) };
};

export const prepareCheckoutBenefitsService = async (
  userId,
  { voucherCode = "", pointsToUse = 0, subtotal = 0, shippingFee = 0 } = {}
) => {
  const user = await User.findById(userId).select("loyaltyPoints");
  if (!user) return { error: "KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n" };

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
              description: `DÃ¹ng Ä‘iá»ƒm cho Ä‘Æ¡n ${order.orderCode}`,
              reference: order.orderCode,
            },
          },
        },
        { new: true }
      );
      if (!updatedUser) return { ok: false, message: "Kho Ä‘iá»ƒm khÃ´ng cÃ²n Ä‘á»§ Ä‘á»ƒ Ã¡p dá»¥ng cho Ä‘Æ¡n hÃ ng" };
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
                description: `HoÃ n Ä‘iá»ƒm vÃ¬ mÃ£ giáº£m giÃ¡ khÃ´ng cÃ²n há»£p lá»‡ cho Ä‘Æ¡n ${order.orderCode}`,
                reference: order.orderCode,
              },
            },
          });
        }
        return { ok: false, message: "MÃ£ giáº£m giÃ¡ vá»«a háº¿t lÆ°á»£t sá»­ dá»¥ng, vui lÃ²ng chá»n mÃ£ khÃ¡c" };
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("commitOrderBenefitsService error:", error);
    return { ok: false, message: "KhÃ´ng thá»ƒ ghi nháº­n Æ°u Ä‘Ã£i cho Ä‘Æ¡n hÃ ng" };
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
          description: `HoÃ n Ä‘iá»ƒm tá»« Ä‘Æ¡n ${order.orderCode}`,
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
      description: `TÃ­ch Ä‘iá»ƒm mua hÃ ng tá»« Ä‘Æ¡n ${order.orderCode}`,
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
      title: "QuÃ  cáº£m Æ¡n Ä‘Ã¡nh giÃ¡",
      description: "Voucher dÃ nh riÃªng cho láº§n mua tiáº¿p theo sau khi bÃ¬nh luáº­n sáº£n pháº©m.",
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
        description: "ThÆ°á»Ÿng Ä‘iá»ƒm sau khi Ä‘Ã¡nh giÃ¡ sáº£n pháº©m Ä‘Ã£ mua",
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
  return { EC: 0, EM: "Láº¥y danh sÃ¡ch khuyáº¿n mÃ£i thÃ nh cÃ´ng", DT: vouchers.map(decorateVoucher) };
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
  if (!user) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n", DT: null };

  const vouchers = await Voucher.find({
    ...activeVoucherFilter(),
    assignedTo: userId,
  }).sort({ createdAt: -1 });

  return {
    EC: 0,
    EM: "Láº¥y kho thÃ nh viÃªn thÃ nh cÃ´ng",
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
  if (!mongoose.Types.ObjectId.isValid(productId)) return { EC: 1, EM: "Sáº£n pháº©m khÃ´ng há»£p lá»‡", DT: null };
  const user = await User.findById(userId);
  if (!user) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n", DT: null };

  const exists = user.favoriteProducts.some((id) => id.toString() === productId);
  user.favoriteProducts = exists
    ? user.favoriteProducts.filter((id) => id.toString() !== productId)
    : [...user.favoriteProducts, productId];
  await user.save();
  return {
    EC: 0,
    EM: exists ? "ÄÃ£ bá» sáº£n pháº©m khá»i danh sÃ¡ch yÃªu thÃ­ch" : "ÄÃ£ thÃªm sáº£n pháº©m yÃªu thÃ­ch",
    DT: { isFavorite: !exists, count: user.favoriteProducts.length },
  };
};

export const recordRecentlyViewedService = async (userId, productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) return { EC: 1, EM: "Sáº£n pháº©m khÃ´ng há»£p lá»‡", DT: null };
  const user = await User.findById(userId);
  if (!user) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y tÃ i khoáº£n", DT: null };

  user.recentlyViewed = [
    { product: productId, viewedAt: new Date() },
    ...user.recentlyViewed.filter((entry) => entry.product.toString() !== productId),
  ].slice(0, 12);
  await user.save();
  return { EC: 0, EM: "ÄÃ£ ghi nháº­n sáº£n pháº©m vá»«a xem", DT: null };
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
    EM: "Láº¥y dá»¯ liá»‡u thÃ nh viÃªn vÃ  mÃ£ giáº£m giÃ¡ thÃ nh cÃ´ng",
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
    runNotification(notifyNewVoucher(voucher));
    return { EC: 0, EM: "Táº¡o mÃ£ giáº£m giÃ¡ thÃ nh cÃ´ng", DT: decorateVoucher(voucher) };
  } catch (error) {
    console.error("createVoucherService error:", error);
    return { EC: 1, EM: error.code === 11000 ? "MÃ£ giáº£m giÃ¡ Ä‘Ã£ tá»“n táº¡i" : "KhÃ´ng thá»ƒ táº¡o mÃ£ giáº£m giÃ¡", DT: null };
  }
};
