import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/layout/header.jsx";
import TechScene3D from "./components/layout/TechScene3D.jsx";
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
      <div className="site-3d-shell loading-3d-screen">
        <TechScene3D />
        <div className="loading-card-3d">
          <div className="loading-laptop-icon">
            <span />
          </div>
          <div className="loading-ring-3d" />
          <span>Đang tải LaptopStore BT06...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="site-3d-shell">
      <TechScene3D />
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
