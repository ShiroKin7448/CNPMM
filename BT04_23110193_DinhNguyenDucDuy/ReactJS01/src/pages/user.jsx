import { useEffect, useState } from "react";
import { Table, Tag, Typography, Input, Space, Button, Avatar, Tooltip, Popconfirm, message } from "antd";
import { SearchOutlined, ReloadOutlined, TeamOutlined, UserOutlined, CrownOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getUserApi, deleteUserApi } from "../util/api.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/auth.context.jsx";
import EditUserModal from "../components/EditUserModal.jsx";

const { Title, Text } = Typography;

const UserPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editUser, setEditUser] = useState(null);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isAdmin = auth.user?.role === "admin";

  useEffect(() => { if (!auth.isAuthenticated) navigate("/login"); }, [auth.isAuthenticated]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUserApi();
      if (res?.EC === 0) setUsers(res.DT);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    const res = await deleteUserApi(id);
    if (res?.EC === 0) { message.success("Xóa người dùng thành công!"); fetchUsers(); }
    else message.error(res?.EM || "Xóa thất bại!");
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { title: "#", key: "idx", width: 50, render: (_, __, i) => <Text style={{ color: "#94a3b8", fontWeight: 600 }}>{i + 1}</Text> },
    {
      title: "Người dùng", key: "user",
      render: (_, r) => (
        <Space>
          <Avatar style={{ background: r.role === "admin" ? "linear-gradient(135deg,#f59e0b,#ef4444)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", fontWeight: 700 }}>
            {r.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>ID: {r._id?.slice(-8)}</div>
          </div>
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email", render: e => <Text style={{ color: "#64748b" }}>{e}</Text> },
    {
      title: "Vai trò", dataIndex: "role", key: "role", width: 120,
      render: role => (
        <Tag icon={role === "admin" ? <CrownOutlined /> : <UserOutlined />}
          style={{ background: role === "admin" ? "rgba(245,158,11,0.1)" : "rgba(79,70,229,0.1)", border: `1px solid ${role === "admin" ? "rgba(245,158,11,0.3)" : "rgba(79,70,229,0.3)"}`, color: role === "admin" ? "#b45309" : "#4F46E5", borderRadius: 6, fontWeight: 600 }}>
          {role === "admin" ? "Admin" : "User"}
        </Tag>
      ),
      filters: [{ text: "Admin", value: "admin" }, { text: "User", value: "user" }],
      onFilter: (val, r) => r.role === val,
    },
    {
      title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt", width: 140,
      render: d => <Text style={{ color: "#94a3b8", fontSize: 13 }}>{new Date(d).toLocaleDateString("vi-VN")}</Text>,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    ...(isAdmin ? [{
      title: "Hành động", key: "actions", width: 120,
      render: (_, r) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button size="small" icon={<EditOutlined />} onClick={() => setEditUser(r)}
              style={{ borderColor: "#4F46E5", color: "#4F46E5" }} />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng?"
            description="Hành động này không thể hoàn tác!"
            onConfirm={() => handleDelete(r._id)}
            okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f8fafc", padding: "32px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, background: "linear-gradient(135deg,#4F46E5,#8b5cf6)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TeamOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <div>
              <Title level={3} style={{ margin: 0, color: "#1e293b", fontWeight: 700 }}>Quản lý User</Title>
              <Text style={{ color: "#94a3b8", fontSize: 14 }}>Tổng: <strong style={{ color: "#4F46E5" }}>{filtered.length}</strong> người dùng</Text>
            </div>
          </div>
          <Space>
            <Input id="user-search-input" placeholder="Tìm theo tên hoặc email..."
              prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
              value={searchText} onChange={e => setSearchText(e.target.value)}
              style={{ width: 280, borderRadius: 10 }} allowClear />
            <Button id="refresh-users-btn" icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}
              style={{ borderRadius: 10, borderColor: "#4F46E5", color: "#4F46E5" }}>Làm mới</Button>
          </Space>
        </div>

        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <Table id="users-table" dataSource={filtered} columns={columns} rowKey="_id" loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t, r) => `${r[0]}-${r[1]} của ${t} người dùng` }}
            scroll={{ x: 700 }} />
        </div>
      </div>

      {editUser && (
        <EditUserModal user={editUser} open={!!editUser} onClose={() => setEditUser(null)} onSuccess={fetchUsers} />
      )}
    </div>
  );
};

export default UserPage;
