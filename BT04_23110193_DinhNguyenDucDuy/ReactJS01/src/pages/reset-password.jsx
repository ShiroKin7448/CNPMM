import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, notification } from "antd";
import { LockOutlined, CheckCircleOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { resetPasswordApi } from "../util/api.js";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await resetPasswordApi(token, values.password);
      if (res?.EC === 0) {
        setSuccess(true);
        notification.success({
          message: "Đặt lại mật khẩu thành công",
          description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Đặt lại thất bại",
          description: res?.EM || "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error?.EM || "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        title="Mật khẩu đã được đổi"
        subtitle="Tài khoản đã được xác minh qua email reset. Hãy đăng nhập bằng mật khẩu mới."
        icon={<CheckCircleOutlined style={{ fontSize: 32 }} />}
      >
        <Button
          id="go-to-login-btn"
          size="large"
          block
          onClick={() => navigate("/login")}
          style={{ height: 50, borderRadius: 14, background: "#000000", color: "#C0FF6B", border: "none", fontWeight: 800 }}
        >
          Đăng nhập ngay
        </Button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đặt mật khẩu mới"
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn."
      icon={<LockOutlined style={{ fontSize: 28 }} />}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold no-underline text-black">
          <ArrowLeftOutlined /> Quay lại đăng nhập
        </Link>
      }
    >
      <Form form={form} name="reset-password-form" layout="vertical" onFinish={handleResetPassword} requiredMark={false}>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            id="new-password-input"
            prefix={<LockOutlined style={{ color: "#656565" }} />}
            placeholder="Mật khẩu mới"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                return !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Mật khẩu không khớp!"));
              },
            }),
          ]}
        >
          <Input.Password
            id="confirm-new-password-input"
            prefix={<LockOutlined style={{ color: "#656565" }} />}
            placeholder="Xác nhận mật khẩu mới"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Button
          id="reset-password-submit-btn"
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          block
          style={{
            background: "#000000",
            border: "none",
            color: "#C0FF6B",
            height: 50,
            borderRadius: 14,
            fontWeight: 800,
            boxShadow: "0 14px 30px rgba(0,0,0,0.22)",
          }}
        >
          {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ResetPassword;
