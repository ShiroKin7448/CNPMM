import { useEffect, useState } from "react";
import { message } from "antd";
import { HiStar } from "react-icons/hi";
import { FiGift, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../context/auth.context.jsx";
import {
  createReviewApi,
  getProductReviewsApi,
  getReviewEligibilityApi,
} from "../../util/api.js";

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const ProductReviews = ({ productId }) => {
  const { auth } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState({ canReview: false, eligibleOrders: [] });
  const [form, setForm] = useState({ orderId: "", rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = async () => {
    const res = await getProductReviewsApi(productId);
    if (res?.EC === 0) setReviews(res.DT || []);
  };

  const loadEligibility = async () => {
    if (!auth.isAuthenticated) return;
    const res = await getReviewEligibilityApi(productId);
    if (res?.EC === 0) {
      setEligibility(res.DT);
      setForm((prev) => ({
        ...prev,
        orderId: res.DT.eligibleOrders?.[0]?._id || "",
      }));
    }
  };

  useEffect(() => {
    loadReviews().catch(() => {});
    loadEligibility().catch(() => {});
  }, [productId, auth.isAuthenticated]);

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await createReviewApi(productId, form);
      if (res?.EC === 0) {
        message.success(res.EM);
        setForm((prev) => ({ ...prev, comment: "", rating: 5 }));
        await Promise.all([loadReviews(), loadEligibility()]);
      }
    } catch (error) {
      message.error(error?.EM || "Không thể gửi đánh giá");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-8 rounded-3xl border border-[#D5D5D5] bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black text-black">
            <FiMessageSquare /> Bình Luận & Đánh Giá
          </h2>
          <p className="mt-1 text-sm font-bold text-[#656565]">
            Chỉ khách đã nhận hàng thành công mới có thể bình luận.
          </p>
        </div>
        <div className="rounded-2xl bg-[#C0FF6B]/30 px-4 py-3 text-xs font-extrabold text-black">
          <FiGift className="mr-1 inline" /> Mỗi lần đánh giá nhận voucher hoặc điểm thưởng
        </div>
      </div>

      {auth.isAuthenticated && eligibility.canReview && (
        <form onSubmit={submitReview} className="mb-6 rounded-2xl border border-black bg-[#f8fff0] p-4">
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <select
              value={form.orderId}
              onChange={(event) => setForm((prev) => ({ ...prev, orderId: event.target.value }))}
              className="rounded-xl border border-[#D5D5D5] bg-white px-3 py-2 text-sm font-bold"
            >
              {eligibility.eligibleOrders.map((order) => (
                <option key={order._id} value={order._id}>#{order.orderCode}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, rating: index + 1 }))}
                  className={index < form.rating ? "text-amber-400" : "text-[#D5D5D5]"}
                  aria-label={`${index + 1} sao`}
                >
                  <HiStar size={24} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            required
            minLength={10}
            rows={3}
            value={form.comment}
            onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
            placeholder="Chia sẻ trải nghiệm thực tế của bạn..."
            className="mt-3 w-full resize-none rounded-xl border border-[#D5D5D5] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-black"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-full bg-black px-5 py-2 text-sm font-extrabold text-[#C0FF6B] disabled:opacity-60"
          >
            {submitting ? "Đang gửi..." : "Gửi đánh giá và nhận quà"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review._id} className="rounded-2xl border border-[#D5D5D5] bg-[#f8f8f8] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-sm font-black text-black">{review.user?.name || "Khách hàng"}</span>
                <span className="ml-2 rounded-full bg-black px-2 py-1 text-[10px] font-extrabold text-[#C0FF6B]">
                  {review.user?.membershipTier || "MEMBER"}
                </span>
              </div>
              <span className="text-xs font-bold text-[#656565]">{formatDate(review.createdAt)}</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, index) => (
                <HiStar key={index} size={15} className={index < review.rating ? "" : "text-[#D5D5D5]"} />
              ))}
              <span className="ml-2 text-xs font-bold text-[#656565]">Đã mua hàng</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-[#656565]">{review.comment}</p>
          </article>
        ))}
        {!reviews.length && (
          <div className="rounded-2xl bg-[#f6f6f6] p-5 text-sm font-bold text-[#656565]">
            Chưa có bình luận. Khách đã mua sản phẩm có thể gửi đánh giá đầu tiên.
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductReviews;
