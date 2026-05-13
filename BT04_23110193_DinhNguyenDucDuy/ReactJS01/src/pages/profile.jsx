import { useState, useEffect } from "react";
import { useAuth } from "../components/context/auth.context.jsx";
import { fetchAccountApi, changePasswordApi } from "../util/api.js";
import { message } from "antd";
import { FiUser, FiMail, FiShield, FiKey, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

const ProfilePage = () => {
  const { auth } = useAuth();
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ old: false, new_: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const user = auth.user;
  const avatarChar = user?.name?.charAt(0)?.toUpperCase() || "U";

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (form.newPassword.length < 6) {
      message.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }
    setLoading(true);
    try {
      const res = await changePasswordApi({ oldPassword: form.oldPassword, newPassword: form.newPassword });
      if (res?.EC === 0) {
        message.success("Đổi mật khẩu thành công!");
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        message.error(res?.EM || "Đổi mật khẩu thất bại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const ROLE_MAP = { admin: { label: "Admin", cls: "bg-amber-100 text-amber-700" }, user: { label: "Thành Viên", cls: "bg-indigo-100 text-indigo-700" } };
  const roleInfo = ROLE_MAP[user?.role] ?? ROLE_MAP.user;

  const PasswordInput = ({ name, label, showKey, icon }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={show[showKey] ? "text" : "password"}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder="••••••••"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-800 text-sm"
          required
        />
        <button
          type="button"
          onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {show[showKey] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Cover */}
          <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-400" />
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="flex items-end gap-4 -mt-10 mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg border-4 border-white">
                {avatarChar}
              </div>
              <div className="pb-1">
                <h1 className="text-xl font-bold text-slate-800">{user?.name}</h1>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.cls}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-3">
              {[
                { icon: <FiUser size={16} />, label: "Họ tên", value: user?.name },
                { icon: <FiMail size={16} />, label: "Email", value: user?.email },
                { icon: <FiShield size={16} />, label: "Vai trò", value: roleInfo.label },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
                  <div className="text-indigo-500">{row.icon}</div>
                  <div>
                    <p className="text-xs text-slate-400">{row.label}</p>
                    <p className="text-sm font-semibold text-slate-800">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change password card */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <FiKey size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Đổi Mật Khẩu</h2>
              <p className="text-xs text-slate-400">Bảo mật tài khoản của bạn</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordInput name="oldPassword" label="Mật khẩu hiện tại" showKey="old" />
            <PasswordInput name="newPassword" label="Mật khẩu mới" showKey="new_" />
            <PasswordInput name="confirmPassword" label="Xác nhận mật khẩu mới" showKey="confirm" />

            {/* Strength hint */}
            {form.newPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`h-1 flex-1 rounded-full ${form.newPassword.length >= 8 ? "bg-emerald-400" : form.newPassword.length >= 6 ? "bg-amber-400" : "bg-red-400"}`} />
                <span className="text-slate-500">{form.newPassword.length >= 8 ? "Mạnh" : form.newPassword.length >= 6 ? "Trung bình" : "Yếu"}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:shadow-lg"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><FiCheck size={18} /> Cập Nhật Mật Khẩu</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
