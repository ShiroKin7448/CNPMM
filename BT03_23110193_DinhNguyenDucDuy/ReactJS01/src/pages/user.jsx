import { useEffect, useState } from "react";
import { Table, Tag, Typography, Input, Space, Button, Avatar, Tooltip } from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import { getUserApi } from "../util/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/auth.context.jsx";

const { Title, Text } = Typography;

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
    }
  }, [auth.isAuthenticated, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUserApi();
      if (res && res.EC === 0) {
        setUsers(res.DT);
      }
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users theo search
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Table columns config
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => (
        <Text style={{ color: "#64748b", fontWeight: 600 }}>
          {index + 1}
        </Text>
      ),
    },
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar
            style={{
              background:
                record.role === "admin"
                  ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                  : "linear-gradient(135deg, #6366f1, #0ea5e9)",
              fontWeight: 700,
            }}
          >
            {record.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ color: "#f8fafc", fontWeight: 600, lineHeight: 1.3 }}>
              {record.name}
            </div>
            <div style={{ color: "#64748b", fontSize: "12px" }}>
              ID: {record._id?.slice(-8)}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <Text style={{ color: "#94a3b8" }}>{email}</Text>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 120,
      render: (role) => (
        <Tag
          icon={role === "admin" ? <CrownOutlined /> : <UserOutlined />}
          style={{
            background:
              role === "admin"
                ? "rgba(245,158,11,0.15)"
                : "rgba(99,102,241,0.15)",
            border: `1px solid ${role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(99,102,241,0.3)"}`,
            color: role === "admin" ? "#f59e0b" : "#a5b4fc",
            borderRadius: "6px",
            fontWeight: 600,
            textTransform: "capitalize",
          }}
        >
          {role === "admin" ? "Admin" : "User"}
        </Tag>
      ),
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString("vi-VN")}>
          <Text style={{ color: "#64748b", fontSize: "13px" }}>
            {new Date(date).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            })}
          </Text>
        </Tooltip>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
  ];

  return (
    <div
      style={{
        minHeight: "calc(100vh - 64px)",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Page Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "linear-gradient(135deg, #6366f1, #0ea5e9)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <TeamOutlined style={{ fontSize: "20px", color: "#fff" }} />
              </div>
              <div>
                <Title
                  level={3}
                  style={{ color: "#f8fafc", margin: 0, fontWeight: 700 }}
                >
                  Quản lý User
                </Title>
                <Text style={{ color: "#64748b", fontSize: "14px" }}>
                  Tổng cộng:{" "}
                  <strong style={{ color: "#6366f1" }}>{filteredUsers.length}</strong> người dùng
                </Text>
              </div>
            </div>
          </div>

          {/* Search + Refresh */}
          <Space>
            <Input
              id="user-search-input"
              placeholder="Tìm kiếm theo tên hoặc email..."
              prefix={<SearchOutlined style={{ color: "#64748b" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#f8fafc",
                borderRadius: "10px",
                width: "280px",
              }}
              allowClear
            />
            <Button
              id="refresh-users-btn"
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
              loading={loading}
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
                color: "#a5b4fc",
                borderRadius: "10px",
              }}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ overflow: "hidden" }}>
          <Table
            id="users-table"
            dataSource={filteredUsers}
            columns={columns}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
              style: { padding: "16px 24px" },
            }}
            scroll={{ x: 700 }}
            style={{ background: "transparent" }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserPage;
