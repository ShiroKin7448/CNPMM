import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Typography, Divider } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { createUserApi } from "../util/api.js";

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const res = await createUserApi(values.name, values.email, values.password);
      if (res && res.EC === 0) {
        notification.success({
          message: "Đăng ký thành công! 🎉",
          description: "Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.",
          placement: "topRight",
        });
        navigate("/login");
      } else {
        notification.error({
          message: "Đăng ký thất bại",
          description: res?.EM || "Đã có lỗi xảy ra",
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
      {/* Background decorations */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          top: "-100px",
          right: "-100px",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "300px",
          height: "300px",
          background: "radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)",
          bottom: "-50px",
          left: "-50px",
          borderRadius: "50%",
        }}
      />

      {/* Register Card */}
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
              background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(99,102,241,0.4)",
            }}
          >
            <UserAddOutlined style={{ fontSize: "28px", color: "#fff" }} />
          </div>
          <Title
            level={2}
            style={{
              color: "#f8fafc",
              margin: 0,
              fontWeight: 700,
            }}
          >
            Tạo tài khoản
          </Title>
          <Text style={{ color: "#94a3b8" }}>
            Đăng ký để bắt đầu sử dụng hệ thống
          </Text>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="register-form"
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập họ tên!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
            ]}
          >
            <Input
              id="register-name"
              prefix={<UserOutlined style={{ color: "#6366f1" }} />}
              placeholder="Họ và tên"
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
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              id="register-email"
              prefix={<MailOutlined style={{ color: "#6366f1" }} />}
              placeholder="Email"
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
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password
              id="register-password"
              prefix={<LockOutlined style={{ color: "#6366f1" }} />}
              placeholder="Mật khẩu"
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
              id="register-confirm-password"
              prefix={<LockOutlined style={{ color: "#6366f1" }} />}
              placeholder="Xác nhận mật khẩu"
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
              id="register-submit-btn"
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                border: "none",
                height: "48px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}>
          hoặc
        </Divider>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#94a3b8" }}>
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              style={{
                color: "#6366f1",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Đăng nhập ngay
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Register;
