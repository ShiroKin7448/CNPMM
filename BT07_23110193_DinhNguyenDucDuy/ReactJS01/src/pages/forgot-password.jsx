import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Modal, Steps } from "antd";
import { MailOutlined, KeyOutlined, ArrowLeftOutlined, SendOutlined, LoginOutlined } from "@ant-design/icons";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { forgotPasswordApi } from "../util/api.js";

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi(values.email);
      if (res?.EC === 0) {
        setSentEmail(res.DT?.email || values.email);
        setEmailSent(true);
      } else {
        notification.error({
          message: "Gửi email thất bại",
          description: res?.EM || "Email không tồn tại",
          placement: "topRight",
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi kết nối",
        description: error?.EM || "Không thể kết nối đến server",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmSubmit = (values) => {
    if (loading) return;
    Modal.confirm({
      title: "Xác nhận quên mật khẩu",
      content: `Gửi link đặt lại mật khẩu đến ${values.email}?`,
      okText: "Gửi link",
      cancelText: "Kiểm tra lại",
      centered: true,
      okButtonProps: {
        style: { background: "#000000", borderColor: "#000000", color: "#C0FF6B", fontWeight: 700 },
      },
      onOk: () => handleSubmit(values),
    });
  };

  if (emailSent) {
    return (
      <AuthLayout
        title="Kiểm tra email"
        subtitle="Link đặt lại mật khẩu đã được gửi. Link sẽ hết hạn sau 15 phút."
        icon={<MailOutlined style={{ fontSize: 30 }} />}
      >
        <div className="text-center">
          <p className="mb-2 text-sm text-[#656565]">Chúng tôi đã gửi link đến:</p>
          <div className="mb-6 inline-block rounded-xl bg-[#D5D5D5] px-4 py-2 text-sm font-extrabold text-black">
            {sentEmail}
          </div>
          <div className="space-y-3">
            <Button
              id="back-to-login-btn"
              size="large"
              icon={<LoginOutlined />}
              block
              onClick={() => navigate("/login")}
              style={{ height: 48, borderRadius: 14, background: "#000000", color: "#C0FF6B", border: "none", fontWeight: 800 }}
            >
              Đến trang đăng nhập
            </Button>
            <Button
              id="resend-email-btn"
              size="large"
              block
              onClick={() => {
                setEmailSent(false);
                form.resetFields();
              }}
              style={{ height: 46, borderRadius: 14, borderColor: "#D5D5D5", color: "#000000", fontWeight: 700 }}
            >
              Gửi lại email
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email đã đăng ký để nhận link đặt lại mật khẩu."
      icon={<KeyOutlined style={{ fontSize: 28 }} />}
      footer={
        <Link to="/login" className="inline-flex items-center gap-1.5 text-sm font-bold no-underline text-black">
          <ArrowLeftOutlined /> Quay lại đăng nhập
        </Link>
      }
    >
      <Steps
        current={0}
        size="small"
        className="mb-7"
        items={[
          { title: <span className="text-xs">Nhập email</span> },
          { title: <span className="text-xs text-[#656565]">Kiểm tra email</span> },
          { title: <span className="text-xs text-[#656565]">Mật khẩu mới</span> },
        ]}
      />

      <Form form={form} name="forgot-password-form" layout="vertical" onFinish={confirmSubmit} requiredMark={false}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            id="forgot-email-input"
            prefix={<MailOutlined style={{ color: "#656565" }} />}
            placeholder="Email đã đăng ký"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Button
          id="forgot-password-submit-btn"
          type="primary"
          htmlType="submit"
          size="large"
          loading={loading}
          icon={<SendOutlined />}
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
          {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPassword;
