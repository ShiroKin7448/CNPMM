import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, message, Modal, Select } from "antd";
import { FiAward, FiGift, FiPlus, FiStar, FiUsers } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import { createVoucherApi, getAdminLoyaltyApi } from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const emptyForm = {
  code: "",
  title: "",
  discountType: "PERCENT",
  value: 10,
  minOrder: 500000,
  maxDiscount: 500000,
  usageLimit: 100,
  endAt: "2026-12-31",
};

const AdminLoyaltyPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [data, setData] = useState({ vouchers: [], members: [], tiers: [] });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    const res = await getAdminLoyaltyApi();
    if (res?.EC === 0) setData(res.DT);
  };

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/login");
    else if (auth.user.role !== "admin") navigate("/");
    else load().catch((error) => message.error(error?.EM || "Không thể tải dữ liệu ưu đãi"));
  }, [auth.isAuthenticated, auth.user.role]);

  const submit = async () => {
    try {
      const res = await createVoucherApi(form);
      if (res?.EC === 0) {
        message.success(res.EM);
        setOpen(false);
        setForm(emptyForm);
        await load();
      }
    } catch (error) {
      message.error(error?.EM || "Không thể tạo mã giảm giá");
    }
  };

  if (!auth.isAuthenticated || auth.user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-black">Ưu Đãi & Hạng Thành Viên</h1>
            <p className="mt-1 text-sm font-bold text-[#656565]">Quản lý voucher, kho điểm và phân hạng khách hàng</p>
          </div>
          <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-extrabold text-[#C0FF6B]">
            <FiPlus /> Tạo mã giảm giá
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#D5D5D5] bg-white p-5"><FiGift /><div className="mt-3 text-3xl font-black">{data.vouchers.length}</div><div className="text-sm font-bold text-[#656565]">Mã giảm giá</div></div>
          <div className="rounded-3xl border border-[#D5D5D5] bg-white p-5"><FiUsers /><div className="mt-3 text-3xl font-black">{data.members.length}</div><div className="text-sm font-bold text-[#656565]">Khách hàng</div></div>
          <div className="rounded-3xl border border-[#D5D5D5] bg-[#C0FF6B]/30 p-5"><FiAward /><div className="mt-3 text-3xl font-black">{data.tiers.length}</div><div className="text-sm font-bold text-[#656565]">Hạng thành viên</div></div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5">
            <h2 className="text-xl font-black">Kho Mã Giảm Giá</h2>
            <div className="mt-4 space-y-3">
              {data.vouchers.map((voucher) => (
                <article key={voucher._id} className="rounded-2xl border border-dashed border-black p-4">
                  <div className="flex justify-between gap-3">
                    <div><b>{voucher.code}</b><div className="text-sm font-bold text-[#656565]">{voucher.title}</div></div>
                    <span className="text-sm font-black">{voucher.discountLabel}</span>
                  </div>
                  <div className="mt-2 text-xs font-bold text-[#656565]">Đã dùng {voucher.usedCount}/{voucher.usageLimit} · Tối thiểu {fmt(voucher.minOrder)}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5">
            <h2 className="text-xl font-black">Hạng Thành Viên</h2>
            <div className="mt-4 space-y-3">
              {data.members.map((member) => (
                <article key={member._id} className="flex items-center justify-between rounded-2xl bg-[#f6f6f6] p-4">
                  <div><b>{member.name}</b><div className="text-xs font-bold text-[#656565]">{member.email}</div></div>
                  <div className="text-right"><div className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-black text-[#C0FF6B]"><FiStar /> {member.membershipTier}</div><div className="mt-1 text-xs font-bold text-[#656565]">{member.loyaltyPoints} điểm</div></div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <Modal open={open} title="Tạo mã giảm giá" okText="Tạo mã" cancelText="Đóng" onOk={submit} onCancel={() => setOpen(false)}>
          <div className="grid gap-3">
            <Input placeholder="Mã voucher" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Tên chương trình" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Select value={form.discountType} onChange={(value) => setForm({ ...form, discountType: value })} options={[{ value: "PERCENT", label: "Giảm phần trăm" }, { value: "FIXED", label: "Giảm cố định" }]} />
            <Input type="number" addonBefore="Giá trị" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            <Input type="number" addonBefore="Đơn tối thiểu" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })} />
            <Input type="date" addonBefore="Hạn dùng" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default AdminLoyaltyPage;
