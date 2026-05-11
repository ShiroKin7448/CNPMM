import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Typography, Button, Tag, Spin } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  RocketOutlined,
  CodeOutlined,
  DatabaseOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useAuth } from "../components/context/auth.context.jsx";

const { Title, Text, Paragraph } = Typography;

const features = [
  {
    icon: <TeamOutlined style={{ fontSize: "24px", color: "#6366f1" }} />,
    title: "Quản lý User",
    desc: "Xem danh sách và thông tin tất cả người dùng trong hệ thống",
    color: "#6366f1",
    tag: "MongoDB",
  },
  {
    icon: <SafetyOutlined style={{ fontSize: "24px", color: "#0ea5e9" }} />,
    title: "Xác thực JWT",
    desc: "Bảo mật với JSON Web Token, mã hóa mật khẩu bằng bcrypt",
    color: "#0ea5e9",
    tag: "Security",
  },
  {
    icon: <CodeOutlined style={{ fontSize: "24px", color: "#22c55e" }} />,
    title: "REST API",
    desc: "API chuẩn RESTful với Express.js và response format thống nhất",
    color: "#22c55e",
    tag: "Express.js",
  },
  {
    icon: <DatabaseOutlined style={{ fontSize: "24px", color: "#f59e0b" }} />,
    title: "Forgot Password",
    desc: "Gửi email reset mật khẩu qua SMTP với Nodemailer",
    color: "#f59e0b",
    tag: "Nodemailer",
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          top: "-200px",
          right: "-200px",
          borderRadius: "50%",
          animation: "float 8s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)",
          bottom: "-100px",
          left: "-100px",
          borderRadius: "50%",
          animation: "float 6s ease-in-out infinite reverse",
        }}
      />

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          position: "relative",
          zIndex: 1,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(30px)",
          transition: "all 0.6s ease",
        }}
      >
        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "24px",
            }}
          >
            <RocketOutlined style={{ color: "#6366f1", fontSize: "14px" }} />
            <Text style={{ color: "#a5b4fc", fontSize: "13px", fontWeight: 500 }}>
              BT03 - Lập trình FullStack
            </Text>
          </div>

          <Title
            style={{
              color: "#f8fafc",
              fontSize: "clamp(32px, 5vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.2,
              marginBottom: "20px",
              letterSpacing: "-1px",
            }}
          >
            Hệ thống quản lý
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #6366f1, #0ea5e9, #22c55e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundSize: "200% auto",
                animation: "gradient 3s linear infinite",
              }}
            >
              người dùng
            </span>
          </Title>

          <Paragraph
            style={{
              color: "#94a3b8",
              fontSize: "18px",
              maxWidth: "600px",
              margin: "0 auto 36px",
              lineHeight: 1.8,
            }}
          >
            Dự án FullStack với Node.js + Express + MongoDB + React.js.
            <br />
            Xây dựng bởi{" "}
            <strong style={{ color: "#6366f1" }}>23110193 - Đinh Nguyễn Đức Duy</strong>
          </Paragraph>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            {auth.isAuthenticated ? (
              <Button
                id="view-users-btn"
                type="primary"
                size="large"
                icon={<TeamOutlined />}
                onClick={() => navigate("/user")}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                  border: "none",
                  height: "50px",
                  padding: "0 32px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "16px",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                }}
              >
                Xem danh sách User
              </Button>
            ) : (
              <>
                <Button
                  id="home-login-btn"
                  type="primary"
                  size="large"
                  onClick={() => navigate("/login")}
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                    border: "none",
                    height: "50px",
                    padding: "0 32px",
                    borderRadius: "12px",
                    fontWeight: 600,
                    fontSize: "16px",
                    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  id="home-register-btn"
                  size="large"
                  onClick={() => navigate("/register")}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#f8fafc",
                    height: "50px",
                    padding: "0 32px",
                    borderRadius: "12px",
                    fontWeight: 600,
                    fontSize: "16px",
                  }}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card"
              style={{
                padding: "28px 24px",
                transition: "all 0.3s ease",
                cursor: "default",
                animationDelay: `${index * 0.1}s`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${feature.color}20`;
                e.currentTarget.style.borderColor = `${feature.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "";
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  background: `${feature.color}15`,
                  borderRadius: "14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  border: `1px solid ${feature.color}30`,
                }}
              >
                {feature.icon}
              </div>
              <Tag
                style={{
                  background: `${feature.color}15`,
                  border: `1px solid ${feature.color}30`,
                  color: feature.color,
                  borderRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  marginBottom: "10px",
                }}
              >
                {feature.tag}
              </Tag>
              <Title
                level={5}
                style={{ color: "#f8fafc", marginBottom: "8px", marginTop: "8px" }}
              >
                {feature.title}
              </Title>
              <Text style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.6 }}>
                {feature.desc}
              </Text>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div
          className="glass-card"
          style={{
            marginTop: "32px",
            padding: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <Text style={{ color: "#64748b", fontSize: "13px" }}>Tech Stack:</Text>
          {["Node.js", "Express.js", "MongoDB", "Mongoose", "React.js", "Vite", "Ant Design", "JWT", "bcrypt"].map(
            (tech) => (
              <Tag
                key={tech}
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  color: "#a5b4fc",
                  borderRadius: "6px",
                  padding: "2px 10px",
                }}
              >
                {tech}
              </Tag>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
