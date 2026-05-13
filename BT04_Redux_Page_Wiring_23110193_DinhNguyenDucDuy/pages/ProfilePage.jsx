import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, Header, Alert, Spinner } from "../components/UI";
import { useAuth } from "../redux/hooks";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, isLoading, error, getProfile, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    address: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    getProfile().catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.email) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Tên người dùng không được để trống";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
    }

    if (
      formData.phone &&
      !/^[0-9]{10,11}$/.test(formData.phone.replace(/\D/g, ""))
    ) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        await updateProfile(formData);
        setSuccessMessage("Cập nhật hồ sơ thành công!");
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error("Update profile failed:", err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Header
          title="Hồ sơ của tôi"
          subtitle={`Thông tin hồ sơ của bạn (${user.role})`}
        />

        <Card>
          {error && <Alert type="error" message={error} />}
          {successMessage && <Alert type="success" message={successMessage} />}

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cá nhân
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="text"
                  name="username"
                  label="Tên người dùng"
                  value={formData.username}
                  onChange={handleChange}
                  error={formErrors.username}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />

                <Input
                  type="email"
                  name="email"
                  label="Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  className="bg-gray-100"
                />

                <Input
                  type="text"
                  name="fullName"
                  label="Họ và tên"
                  placeholder="Nhập họ và tên đầy đủ"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />

                <Input
                  type="tel"
                  name="phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleChange}
                  error={formErrors.phone}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-100" : ""}
                />
              </div>

              <Input
                type="text"
                name="address"
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-100" : ""}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Vai trò:</strong>{" "}
                {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>

            <div className="flex gap-4">
              {!isEditing ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                    className="flex-1"
                  >
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleLogout}
                    className="flex-1"
                  >
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    loading={isLoading}
                    className="flex-1"
                  >
                    Lưu thay đổi
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        username: user.username || "",
                        email: user.email || "",
                        fullName: user.fullName || "",
                        phone: user.phone || "",
                        address: user.address || "",
                      });
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>

        <Card className="mt-8 border-t-4 border-danger">
          <h3 className="text-lg font-semibold text-danger mb-4">
            Khu vực nguy hiểm
          </h3>
          <Button
            variant="danger"
            onClick={() => {
              if (
                window.confirm(
                  "Bạn có chắc chắn muốn xóa tài khoản không? Hành động này không thể hoàn tác.",
                )
              ) {
                console.log("Delete account");
              }
            }}
          >
            Xóa tài khoản vĩnh viễn
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
