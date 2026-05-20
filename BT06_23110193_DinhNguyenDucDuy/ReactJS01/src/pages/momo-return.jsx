import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { message } from "antd";
import { FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import { confirmMomoReturnApi } from "../util/api.js";

const MomoReturnPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const calledRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login", { replace: true, state: { from: "/payment/momo-return" } });
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const confirmPayment = async () => {
      setLoading(true);
      try {
        const payload = Object.fromEntries(searchParams.entries());
        const res = await confirmMomoReturnApi(payload);
        setResult(res);
        if (res?.EC === 0) {
          message.success(res.EM || "Đã cập nhật thanh toán MoMo");
        } else {
          message.error(res?.EM || "Thanh toán MoMo chưa thành công");
        }
      } catch (error) {
        setResult({ EC: 1, EM: error?.EM || "Không thể xác nhận thanh toán MoMo", DT: null });
        message.error(error?.EM || "Không thể xác nhận thanh toán MoMo");
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
  }, [auth.isAuthenticated, navigate, searchParams]);

  if (!auth.isAuthenticated) return null;

  const order = result?.DT;
  const success = result?.EC === 0 && order?.paymentStatus === "PAID";
  const pending = result?.EC === 0 && order?.paymentStatus === "PENDING";

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <section className="rounded-3xl border border-[#D5D5D5] bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-black text-[#C0FF6B]">
            {loading ? <FiClock size={28} /> : success ? <FiCheckCircle size={28} /> : pending ? <FiClock size={28} /> : <FiXCircle size={28} />}
          </div>

          <h1 className="text-2xl font-black text-black">
            {loading
              ? "Đang xác nhận MoMo"
              : success
                ? "Thanh toán MoMo thành công"
                : pending
                  ? "MoMo đang chờ xử lý"
                  : "Thanh toán MoMo chưa thành công"}
          </h1>
          <p className="mt-3 text-sm font-semibold text-[#656565]">
            {loading ? "Hệ thống đang kiểm tra chữ ký và cập nhật đơn hàng." : result?.EM}
          </p>

          {order && (
            <div className="mt-6 rounded-2xl border border-[#D5D5D5] bg-[#f6f6f6] p-4 text-left">
              <div className="text-sm font-extrabold text-black">#{order.orderCode}</div>
              <div className="mt-1 text-sm font-bold text-[#656565]">{order.paymentStatusLabel}</div>
              <div className="mt-1 text-sm font-bold text-[#656565]">{order.statusLabel}</div>
            </div>
          )}

          {!loading && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {order?._id && (
                <Link
                  to={`/orders/${order._id}`}
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B] no-underline transition hover:bg-[#C0FF6B] hover:text-black"
                >
                  Xem đơn hàng
                </Link>
              )}
              <Link
                to="/orders"
                className="rounded-2xl border border-[#D5D5D5] px-5 py-3 text-sm font-extrabold text-black no-underline transition hover:border-black"
              >
                Lịch sử mua hàng
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MomoReturnPage;
