import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, notification, Modal } from "antd";
import { UserOutlined, MailOutlined, LockOutlined, UserAddOutlined, CheckCircleOutlined } from "@ant-design/icons";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { createUserApi, resendVerificationApi } from "../util/api.js";

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const res = await createUserApi(values.name, values.email, values.password);
      if (res?.EC === 0) {
        setDone({ email: res.DT?.email || values.email });
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

  const confirmRegister = (values) => {
    if (loading) return;
    Modal.confirm({
      title: "Xác nhận đăng ký",
      content: `Tạo tài khoản ${values.email} và gửi email xác nhận?`,
      okText: "Tạo tài khoản",
      cancelText: "Kiểm tra lại",
      centered: true,
      okButtonProps: {
        style: { background: "#000000", borderColor: "#000000", color: "#C0FF6B", fontWeight: 700 },
      },
      onOk: () => handleRegister(values),
    });
  };

  if (done) {
    return (
      <AuthLayout
        title="Kiểm tra hộp thư"
        subtitle="Tài khoản đã được tạo, chỉ cần xác nhận email để kích hoạt."
        icon={<CheckCircleOutlined style={{ fontSize: 32 }} />}
      >
        <div className="text-center">
          <p className="mb-2 text-sm text-[#656565]">Email xác nhận đã được gửi đến:</p>
          <div className="mb-6 inline-block rounded-xl bg-[#D5D5D5] px-4 py-2 text-sm font-extrabold text-black">
            {done.email}
          </div>
          <p className="mb-6 text-sm leading-relaxed text-[#656565]">
            Mở email và bấm nút xác nhận. Nếu không thấy, hãy kiểm tra thư mục Spam.
          </p>
          <div className="space-y-3">
            <Button
              id="register-go-login-btn"
              size="large"
              block
              onClick={() => navigate("/login")}
              style={{ height: 48, borderRadius: 14, background: "#000000", color: "#C0FF6B", border: "none", fontWeight: 800 }}
            >
              Đến trang đăng nhập
            </Button>
            <Button
              id="register-resend-email-btn"
              size="large"
              block
              onClick={async () => {
                const r = await resendVerificationApi(done.email);
                if (r?.EC === 0) notification.success({ message: "Đã gửi lại email xác nhận" });
                else notification.error({ message: r?.EM || "Gửi thất bại" });
              }}
              style={{ height: 46, borderRadius: 14, borderColor: "#D5D5D5", color: "#000000", fontWeight: 700 }}
            >
              Gửi lại email xác nhận
            </Button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Đăng ký để theo dõi sản phẩm, nhận ưu đãi và mua sắm nhanh hơn."
      icon={<UserAddOutlined style={{ fontSize: 28 }} />}
      footer={
        <>
          <span className="text-sm text-[#656565]">Đã có tài khoản? </span>
          <Link to="/login" className="text-sm font-extrabold no-underline text-black">
            Đăng nhập
          </Link>
        </>
      }
    >
      <Form form={form} name="register-form" layout="vertical" onFinish={confirmRegister} requiredMark={false}>
        <Form.Item
          name="name"
          rules={[
            { required: true, message: "Vui lòng nhập họ tên!" },
            { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
          ]}
        >
          <Input
            id="register-name"
            prefix={<UserOutlined style={{ color: "#656565" }} />}
            placeholder="Họ và tên"
            size="large"
            className="rounded-xl"
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
            prefix={<MailOutlined style={{ color: "#656565" }} />}
            placeholder="Email"
            size="large"
            className="rounded-xl"
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
            prefix={<LockOutlined style={{ color: "#656565" }} />}
            placeholder="Mật khẩu"
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
            id="register-confirm-password"
            prefix={<LockOutlined style={{ color: "#656565" }} />}
            placeholder="Xác nhận mật khẩu"
            size="large"
            className="rounded-xl"
          />
        </Form.Item>

        <Button
          id="register-submit-btn"
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
          {loading ? "Đang đăng ký..." : "Đăng ký"}
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default Register;
