import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Spin } from "antd";
import Header from "./components/layout/header.jsx";
import { useAuth } from "./components/context/auth.context.jsx";
import { fetchAccountApi } from "./util/api.js";

const App = () => {
  const { setAuth, setAppLoading, appLoading } = useAuth();

  // Fetch account khi user F5 trình duyệt
  // Token còn trong localStorage nhưng auth context bị reset
  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setAppLoading(false);
        return;
      }

      try {
        const res = await fetchAccountApi();
        if (res && res.EC === 0) {
          setAuth({
            isAuthenticated: true,
            user: {
              id: res.DT._id,
              name: res.DT.name,
              email: res.DT.email,
              role: res.DT.role,
            },
          });
        } else {
          // Token không hợp lệ, xóa khỏi localStorage
          localStorage.removeItem("access_token");
        }
      } catch (error) {
        console.error("fetchAccount error:", error);
        localStorage.removeItem("access_token");
      } finally {
        setAppLoading(false);
      }
    };

    fetchAccount();
  }, []);

  // Hiển thị loading spinner khi đang kiểm tra auth
  if (appLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f0f1a",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            animation: "float 2s ease-in-out infinite",
          }}
        >
          ⚡
        </div>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontSize: "14px" }}>
          Đang tải ứng dụng...
        </span>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default App;
