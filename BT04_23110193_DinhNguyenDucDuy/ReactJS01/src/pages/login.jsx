import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Typography, Divider, Checkbox } from "antd";
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { loginApi } from "../util/api.js";
import { useAuth } from "../components/context/auth.context.jsx";

const { Title, Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await loginApi(values.email, values.password);
      if (res && res.EC === 0) {
        // Lưu access_token vào localStorage
        localStorage.setItem("access_token", res.DT.access_token);

        // Cập nhật auth context
        setAuth({
          isAuthenticated: true,
          user: {
            id: res.DT.user.id,
            name: res.DT.user.name,
            email: res.DT.user.email,
            role: res.DT.user.role,
          },
        });

        notification.success({
          message: "Đăng nhập thành công! 🎉",
          description: `Chào mừng trở lại, ${res.DT.user.name}!`,
          placement: "topRight",
        });

        navigate("/");
      } else {
        notification.error({
          message: "Đăng nhập thất bại",
          description: res?.EM || "Email hoặc mật khẩu không đúng",
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
          width: "500px",
          height: "500px",
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          top: "-150px",
          left: "-150px",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "350px",
          height: "350px",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          borderRadius: "50%",
        }}
      />

      {/* Login Card */}
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
              background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 0 30px rgba(14,165,233,0.4)",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <LoginOutlined style={{ fontSize: "28px", color: "#fff" }} />
          </div>
          <Title
            level={2}
            style={{
              color: "#f8fafc",
              margin: 0,
              fontWeight: 700,
            }}
          >
            Chào mừng trở lại
          </Title>
          <Text style={{ color: "#94a3b8" }}>
            Đăng nhập vào tài khoản của bạn
          </Text>
        </div>

        {/* Form */}
        <Form
          form={form}
          name="login-form"
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              id="login-email"
              prefix={<MailOutlined style={{ color: "#0ea5e9" }} />}
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
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              id="login-password"
              prefix={<LockOutlined style={{ color: "#0ea5e9" }} />}
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

          {/* Remember me + Forgot password */}
          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: "#94a3b8" }}>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link
                to="/forgot-password"
                style={{
                  color: "#6366f1",
                  fontWeight: 500,
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              id="login-submit-btn"
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
                border: "none",
                height: "48px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "16px",
                boxShadow: "0 4px 20px rgba(14,165,233,0.4)",
              }}
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: "rgba(255,255,255,0.1)", color: "#94a3b8" }}>
          hoặc
        </Divider>

        <div style={{ textAlign: "center" }}>
          <Text style={{ color: "#94a3b8" }}>
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              style={{
                color: "#6366f1",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Đăng ký ngay
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default Login;
