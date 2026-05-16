import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Checkbox, Modal } from "antd";
import { MailOutlined, LockOutlined, LoginOutlined, WarningOutlined } from "@ant-design/icons";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { loginApi, resendVerificationApi } from "../util/api.js";
import { useAuth } from "../components/context/auth.context.jsx";

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(null);

  const handleLogin = async (values) => {
    setLoading(true);
    setUnverified(null);
    try {
      const res = await loginApi(values.email, values.password);
      if (res?.EC === 0) {
        localStorage.setItem("access_token", res.DT.access_token);
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
          message: "Đăng nhập thành công",
          description: `Chào mừng trở lại, ${res.DT.user.name}!`,
          placement: "topRight",
        });
        navigate("/");
      } else if (res?.EC === 2) {
        setUnverified(res.DT?.email || values.email);
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

  const confirmLogin = (values) => {
    if (loading) return;
    Modal.confirm({
      title: "Xác nhận đăng nhập",
      content: `Đăng nhập bằng tài khoản ${values.email}?`,
      okText: "Đăng nhập",
      cancelText: "Kiểm tra lại",
      centered: true,
      okButtonProps: {
        style: { background: "#000000", borderColor: "#000000", color: "#C0FF6B", fontWeight: 700 },
      },
      onOk: () => handleLogin(values),
    });
  };

  const resendVerification = async () => {
    const r = await resendVerificationApi(unverified);
    if (r?.EC === 0) {
      notification.success({ message: "Đã gửi lại email xác nhận" });
    } else {
      notification.error({ message: r?.EM || "Gửi lại email xác nhận thất bại" });
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      subtitle="Truy cập tài khoản để tiếp tục mua sắm laptop và phụ kiện chính hãng."
      icon={<LoginOutlined style={{ fontSize: 28 }} />}
      footer={
        <>
          <span className="text-sm text-[#656565]">Chưa có tài khoản? </span>
          <Link to="/register" className="text-sm font-extrabold no-underline text-black">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      {unverified && (
        <div className="mb-5 rounded-2xl border border-[#C0FF6B] bg-[#C0FF6B]/20 p-4">
          <div className="mb-1 flex items-center gap-2 text-sm font-bold text-black">
            <WarningOutlined /> Email chưa được xác nhận
          </div>
          <p className="mb-2 text-xs leading-relaxed text-[#656565]">
            Kiểm tra hộp thư <b>{unverified}</b> hoặc gửi lại email xác nhận.
          </p>
          <button
            type="button"
            onClick={resendVerification}
            className="text-xs font-extrabold underline"
            style={{ color: "#000000" }}
          >
            Gửi lại email xác nhận
          </button>
        </div>
      )}

      <Form form={form} name="login-form" layout="vertical" onFinish={confirmLogin} requiredMark={false}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input
            id="login-email"
            prefix={<MailOutlined style={{ color: "#656565" }} />}
            placeholder="Email"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
          <Input.Password
            id="login-password"
            prefix={<LockOutlined style={{ color: "#656565" }} />}
            placeholder="Mật khẩu"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <div className="mb-5 flex items-center justify-between gap-3">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ</Checkbox>
          </Form.Item>
          <Link to="/forgot-password" className="text-sm font-bold no-underline text-black">
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          id="login-submit-btn"
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
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default Login;
