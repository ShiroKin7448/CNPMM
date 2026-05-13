import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Typography, Steps } from "antd";
import {
  MailOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { forgotPasswordApi } from "../util/api.js";

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const handleForgotPassword = async (values) => {
    setLoading(true);
    try {
      const res = await forgotPasswordApi(values.email);
      if (res && res.EC === 0) {
        setSentEmail(values.email);
        setEmailSent(true);
        notification.success({
          message: "Email đã được gửi! 📧",
          description: res.EM,
          placement: "topRight",
          duration: 6,
        });
      } else {
        notification.error({
          message: "Gửi email thất bại",
          description: res?.EM || "Email không tồn tại trong hệ thống",
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

  if (emailSent) {
    return (
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
          padding: "24px",
        }}
      >
        <div
          className="glass-card fade-in-up"
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 0 30px rgba(34,197,94,0.4)",
              animation: "float 3s ease-in-out infinite",
              fontSize: "36px",
            }}
          >
            📧
          </div>

          <Title level={2} style={{ color: "#f8fafc", marginBottom: "8px" }}>
            Kiểm tra email của bạn!
          </Title>
          <Paragraph style={{ color: "#94a3b8", marginBottom: "24px" }}>
            Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
            <strong style={{ color: "#6366f1" }}>{sentEmail}</strong>.
            <br />
            Link này sẽ hết hạn sau <strong style={{ color: "#f59e0b" }}>15 phút</strong>.
          </Paragraph>

          <div
            style={{
              background: "rgba(255,255,255,0.05)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "24px",
            }}
          >
            <Text style={{ color: "#94a3b8", fontSize: "14px" }}>
              💡 Không thấy email? Kiểm tra thư mục <strong style={{ color: "#f8fafc" }}>Spam/Junk</strong>
            </Text>
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <Button
              id="back-to-login-btn"
              type="primary"
              icon={<LoginOutlined />}
              size="large"
              onClick={() => navigate("/login")}
              style={{
                background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
              }}
            >
              Về trang đăng nhập
            </Button>
            <Button
              id="resend-email-btn"
              size="large"
              onClick={() => {
                setEmailSent(false);
                form.resetFields();
              }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
                borderRadius: "10px",
              }}
            >
              Gửi lại email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decoration */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
        }}
      />

      {/* Forgot Password Card */}
      <div
        className="glass-card fade-in-up"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(245,158,11,0.4)",
            }}
          >
            <KeyOutlined style={{ fontSize: "28px", color: "#fff" }} />
          </div>
          <Title
            level={2}
            style={{
              color: "#f8fafc",
              margin: 0,
              fontWeight: 700,
            }}
          >
            Quên mật khẩu
          </Title>
          <Text style={{ color: "#94a3b8" }}>
            Nhập email để nhận link đặt lại mật khẩu
          </Text>
        </div>

        {/* Steps indicator */}
        <Steps
          current={0}
          size="small"
          style={{ marginBottom: "28px" }}
          items={[
            { title: <span style={{ color: "#f8fafc", fontSize: "12px" }}>Nhập email</span> },
            { title: <span style={{ color: "#64748b", fontSize: "12px" }}>Kiểm tra email</span> },
            { title: <span style={{ color: "#64748b", fontSize: "12px" }}>Đặt mật khẩu mới</span> },
          ]}
        />

        {/* Form */}
        <Form
          form={form}
          name="forgot-password-form"
          layout="vertical"
          onFinish={handleForgotPassword}
          requiredMark={false}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              id="forgot-email-input"
              prefix={<MailOutlined style={{ color: "#f59e0b" }} />}
              placeholder="Nhập email đã đăng ký"
              size="large"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button
              id="forgot-password-submit-btn"
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              icon={<SendOutlined />}
              block
              style={{
                background: "linear-gradient(135deg, #f59e0b, #ef4444)",
                border: "none",
                height: "48px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
              }}
            >
              {loading ? "Đang gửi email..." : "Gửi link đặt lại mật khẩu"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link
            to="/login"
            style={{
              color: "#94a3b8",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.3s",
            }}
          >
            <ArrowLeftOutlined />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
