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
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", flexDirection: "column", gap: "16px" }}>
        <div style={{ width: "60px", height: "60px", background: "linear-gradient(135deg, #4F46E5, #8b5cf6)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", boxShadow: "0 8px 24px rgba(79,70,229,0.3)" }}>
          💻
        </div>
        <div style={{ width: "40px", height: "40px", border: "3px solid #4F46E5", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <span style={{ color: "#94a3b8", fontSize: "14px", fontWeight: 500 }}>Đang tải LaptopStore...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
