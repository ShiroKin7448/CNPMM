import { useEffect, useMemo, useState } from "react";
import { Input, message, Modal } from "antd";
import { FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { cancelOrderApi } from "../../util/api.js";

const DIRECT_REASONS = [
  "Tôi muốn đặt lại đơn khác",
  "Tôi cần đổi số lượng sản phẩm",
  "Tôi cần cập nhật địa chỉ nhận hàng",
  "Tôi muốn đổi phương thức thanh toán",
];

const REQUEST_REASONS = [
  "Tôi cần shop hỗ trợ đổi thông tin đơn",
  "Tôi muốn đổi sang sản phẩm khác",
  "Tôi cần cập nhật địa chỉ nhận hàng",
  "Tôi muốn hủy và nhận hoàn tiền",
];

const CancelOrderModal = ({ order, open, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const policy = order?.cancelPolicy || {};
  const isRequest = policy.action === "request";
  const reasons = useMemo(() => (isRequest ? REQUEST_REASONS : DIRECT_REASONS), [isRequest]);

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      message.warning("Vui lòng chọn hoặc nhập lý do hủy đơn");
      return;
    }

    setSubmitting(true);
    try {
      const res = await cancelOrderApi(order._id, trimmedReason);
      if (res?.EC === 0) {
        message.success(res.EM);
        onSuccess?.(res.DT);
        onClose?.();
      } else {
        message.error(res?.EM || "Không thể xử lý hủy đơn");
      }
    } catch (error) {
      message.error(error?.EM || "Không thể xử lý hủy đơn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isRequest ? "Gửi yêu cầu hủy đơn" : "Hủy đơn hàng"}
      okText={isRequest ? "Gửi yêu cầu" : "Xác nhận hủy"}
      cancelText="Đóng"
      confirmLoading={submitting}
      okButtonProps={{ danger: !isRequest }}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnHidden
    >
      <div className="space-y-4">
        <div className={`flex gap-3 rounded-2xl border p-4 ${isRequest ? "border-orange-100 bg-orange-50" : "border-red-100 bg-red-50"}`}>
          <div className="mt-0.5 text-black">
            {isRequest ? <FiAlertTriangle size={20} /> : <FiCheckCircle size={20} />}
          </div>
          <div>
            <div className="text-sm font-extrabold text-black">{policy.title}</div>
            <div className="mt-1 text-sm font-semibold text-[#656565]">{policy.description}</div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-extrabold uppercase text-[#656565]">Lý do</div>
          <div className="mb-3 flex flex-wrap gap-2">
            {reasons.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setReason(item)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  reason === item
                    ? "border-black bg-black text-[#C0FF6B]"
                    : "border-[#D5D5D5] bg-white text-black hover:border-black"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <Input.TextArea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={4}
            placeholder="Nhập lý do cụ thể để shop xử lý rõ hơn"
            maxLength={240}
            showCount
          />
        </div>
      </div>
    </Modal>
  );
};

export default CancelOrderModal;
