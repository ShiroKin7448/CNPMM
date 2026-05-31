import { useState } from "react";
import { Modal, Form, Input, Select, message } from "antd";
import { updateUserApi } from "../util/api.js";

const { Option } = Select;

const EditUserModal = ({ user, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const res = await updateUserApi(user._id, values);
      if (res?.EC === 0) {
        message.success("Cập nhật người dùng thành công!");
        onSuccess();
        onClose();
      } else {
        message.error(res?.EM || "Cập nhật thất bại!");
      }
    } catch {
      // validation error
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={<span className="font-bold text-slate-800">✏️ Chỉnh Sửa Người Dùng</span>}
      open={open}
      onCancel={onClose}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Lưu Thay Đổi"
      cancelText="Hủy"
      okButtonProps={{ style: { background: "#000000", borderColor: "#000000", color: "#C0FF6B" } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ name: user?.name, role: user?.role }}
        className="mt-4"
      >
        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập tên!" }]}>
          <Input placeholder="Nhập họ tên..." />
        </Form.Item>
        <Form.Item label="Vai trò" name="role">
          <Select>
            <Option value="user">👤 Thành Viên</Option>
            <Option value="admin">👑 Admin</Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
