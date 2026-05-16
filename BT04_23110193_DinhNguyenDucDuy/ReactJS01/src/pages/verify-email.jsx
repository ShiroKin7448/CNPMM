import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { verifyEmailApi } from "../util/api.js";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token không hợp lệ.");
      return;
    }

    verifyEmailApi(token)
      .then((r) => {
        if (r?.EC === 0) {
          setStatus("success");
          setMessage(r.EM);
        } else {
          setStatus("error");
          setMessage(r?.EM || "Xác nhận thất bại.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Lỗi kết nối đến server.");
      });
  }, [token]);

  const isLoading = status === "loading";
  const isSuccess = status === "success";

  return (
    <AuthLayout
      title={isLoading ? "Đang xác nhận email" : isSuccess ? "Xác nhận thành công" : "Xác nhận thất bại"}
      subtitle={isLoading ? "Vui lòng chờ trong giây lát." : message}
      icon={
        isLoading ? (
          <LoadingOutlined style={{ fontSize: 30 }} />
        ) : isSuccess ? (
          <CheckCircleOutlined style={{ fontSize: 32 }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: 32 }} />
        )
      }
    >
      {!isLoading && (
        <Button
          size="large"
          block
          onClick={() => navigate(isSuccess ? "/login" : "/register")}
          style={{ height: 50, borderRadius: 14, background: "#000000", color: "#C0FF6B", border: "none", fontWeight: 800 }}
        >
          {isSuccess ? "Đăng nhập ngay" : "Quay lại đăng ký"}
        </Button>
      )}
    </AuthLayout>
  );
};

export default VerifyEmailPage;
