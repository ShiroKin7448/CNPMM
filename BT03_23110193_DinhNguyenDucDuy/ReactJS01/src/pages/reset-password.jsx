import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Form, Input, Button, notification, Typography, Result } from "antd";
import {
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import instance from "../util/axios.customize.js";

const { Title, Text, Paragraph } = Typography;

const ResetPassword = () => {
  const { token } = useParams(); // Lấy token từ URL: /reset-password/:token
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (values) => {
    setLoading(true);
    try {
      const res = await instance.post(`/v1/api/reset-password/${token}`, {
        password: values.password,
      });

      if (res && res.EC === 0) {
        setSuccess(true);
        notification.success({
          message: "Đặt lại mật khẩu thành công! 🎉",
          description: "Bạn có thể đăng nhập bằng mật khẩu mới.",
          placement: "topRight",
        });
      } else {
        notification.error({
          message: "Thất bại",
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

  // Hiển thị màn hình thành công
  if (success) {
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
            maxWidth: "440px",
            padding: "48px 40px",
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
              boxShadow: "0 0 40px rgba(34,197,94,0.4)",
              fontSize: "36px",
            }}
          >
            ✅
          </div>

          <Title level={2} style={{ color: "#f8fafc", marginBottom: "8px" }}>
            Thành công!
          </Title>
          <Paragraph style={{ color: "#94a3b8", marginBottom: "32px" }}>
            Mật khẩu của bạn đã được đặt lại thành công.
            <br />
            Hãy đăng nhập bằng mật khẩu mới.
          </Paragraph>

          <Button
            id="go-to-login-btn"
            type="primary"
            size="large"
            icon={<CheckCircleOutlined />}
            onClick={() => navigate("/login")}
            block
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none",
              height: "48px",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "16px",
              boxShadow: "0 4px 20px rgba(34,197,94,0.4)",
            }}
          >
            Đăng nhập ngay
          </Button>
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
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
        }}
      />

      {/* Card */}
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
              background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(34,197,94,0.4)",
            }}
          >
            <LockOutlined style={{ fontSize: "28px", color: "#fff" }} />
          </div>
          <Title
            level={2}
            style={{ color: "#f8fafc", margin: 0, fontWeight: 700 }}
          >
            Đặt mật khẩu mới
          </Title>
          <Text style={{ color: "#94a3b8" }}>
            Nhập mật khẩu mới cho tài khoản của bạn
          </Text>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="reset-password-form"
          layout="vertical"
          onFinish={handleResetPassword}
          requiredMark={false}
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              id="new-password-input"
              prefix={<LockOutlined style={{ color: "#22c55e" }} />}
              placeholder="Mật khẩu mới"
              size="large"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc",
                borderRadius: "10px",
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              id="confirm-new-password-input"
              prefix={<LockOutlined style={{ color: "#22c55e" }} />}
              placeholder="Xác nhận mật khẩu mới"
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
              id="reset-password-submit-btn"
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                border: "none",
                height: "48px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 20px rgba(34,197,94,0.3)",
              }}
            >
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: "center" }}>
          <Link
            to="/login"
            style={{
              color: "#64748b",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "14px",
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

export default ResetPassword;
