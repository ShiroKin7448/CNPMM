import mongoose from "mongoose";
import Order, { ORDER_STATUS } from "../models/order.js";
import Product from "../models/product.js";
import Review from "../models/review.js";
import { awardReviewRewardService } from "./loyaltyService.js";
import { notifyNewReview } from "./notificationService.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const runNotification = (promise) => {
  if (promise?.catch) promise.catch((error) => console.error("notification error:", error));
};

const updateProductReviewStats = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
        customers: { $addToSet: "$user" },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Math.round(stats.averageRating * 10) / 10 : 0,
    reviewCount: stats?.reviewCount || 0,
    commentCustomerCount: stats?.customers?.length || 0,
  });
};

export const getProductReviewsService = async (productId) => {
  if (!isValidObjectId(productId)) return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
  const reviews = await Review.find({ product: productId })
    .populate("user", "name membershipTier")
    .populate("order", "orderCode deliveredAt")
    .sort({ createdAt: -1 })
    .lean();
  return { EC: 0, EM: "Lấy bình luận thành công", DT: reviews };
};

export const getReviewEligibilityService = async (userId, productId) => {
  if (!isValidObjectId(productId)) return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
  const deliveredOrders = await Order.find({
    user: userId,
    status: ORDER_STATUS.DELIVERED,
    "items.product": productId,
  }).select("orderCode deliveredAt").sort({ deliveredAt: -1 }).lean();

  if (!deliveredOrders.length) {
    return {
      EC: 0,
      EM: "Chưa có đơn giao thành công chứa sản phẩm này",
      DT: { canReview: false, eligibleOrders: [] },
    };
  }

  const reviewedOrders = await Review.find({
    user: userId,
    product: productId,
    order: { $in: deliveredOrders.map((order) => order._id) },
  }).select("order").lean();
  const reviewedSet = new Set(reviewedOrders.map((review) => review.order.toString()));
  const eligibleOrders = deliveredOrders.filter((order) => !reviewedSet.has(order._id.toString()));

  return {
    EC: 0,
    EM: eligibleOrders.length ? "Bạn có thể đánh giá sản phẩm" : "Bạn đã đánh giá các lần mua thành công",
    DT: { canReview: eligibleOrders.length > 0, eligibleOrders },
  };
};

export const createReviewService = async (userId, productId, data = {}) => {
  try {
    if (!isValidObjectId(productId) || !isValidObjectId(data.orderId)) {
      return { EC: 1, EM: "Sản phẩm hoặc đơn hàng không hợp lệ", DT: null };
    }
    const rating = Math.floor(Number(data.rating));
    const comment = data.comment?.toString().trim();
    if (rating < 1 || rating > 5) return { EC: 1, EM: "Vui lòng chọn từ 1 đến 5 sao", DT: null };
    if (!comment || comment.length < 10) return { EC: 1, EM: "Bình luận cần có ít nhất 10 ký tự", DT: null };

    const order = await Order.findOne({
      _id: data.orderId,
      user: userId,
      status: ORDER_STATUS.DELIVERED,
      "items.product": productId,
    });
    if (!order) {
      return { EC: 1, EM: "Chỉ được đánh giá sản phẩm thuộc đơn đã giao thành công", DT: null };
    }

    const existing = await Review.findOne({ user: userId, product: productId, order: order._id });
    if (existing) return { EC: 1, EM: "Bạn đã đánh giá sản phẩm trong đơn này", DT: null };

    const reviewIndex = await Review.countDocuments({ user: userId });
    const reward = await awardReviewRewardService(userId, reviewIndex);
    const review = await Review.create({
      user: userId,
      product: productId,
      order: order._id,
      rating,
      comment,
      rewardType: reward.type,
      rewardPoints: reward.points,
      rewardVoucherCode: reward.voucher?.code || "",
    });
    await updateProductReviewStats(productId);

    const populated = await Review.findById(review._id)
      .populate("user", "name membershipTier")
      .populate("order", "orderCode deliveredAt")
      .lean();
    runNotification(notifyNewReview(review));
    return {
      EC: 0,
      EM: reward.type === "VOUCHER"
        ? `Đánh giá thành công. Bạn nhận được mã ${reward.voucher.code}`
        : `Đánh giá thành công. Bạn nhận được ${reward.points} điểm`,
      DT: { review: populated, reward },
    };
  } catch (error) {
    console.error("createReviewService error:", error);
    return { EC: -1, EM: "Không thể lưu đánh giá sản phẩm", DT: null };
  }
};
