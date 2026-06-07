import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Select, message } from "antd";
import {
  BarChartOutlined, DollarOutlined, ReloadOutlined, ShoppingOutlined,
  TeamOutlined, WalletOutlined,
} from "@ant-design/icons";
import { FiPackage, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../components/context/auth.context.jsx";
import { getAdminStatisticsApi } from "../util/api.js";

const fmt = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtNumber = (n = 0) => new Intl.NumberFormat("vi-VN").format(n);

const toInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultEnd = new Date();
const defaultStart = new Date(defaultEnd.getTime() - 13 * 24 * 60 * 60 * 1000);

const statusTone = {
  NEW: "bg-blue-50 text-blue-700",
  CONFIRMED: "bg-indigo-50 text-indigo-700",
  PREPARING: "bg-amber-50 text-amber-700",
  SHIPPING: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  CANCEL_REQUESTED: "bg-orange-50 text-orange-700",
};

const StatCard = ({ icon, label, value, hint }) => (
  <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black text-[#C0FF6B]">
      {icon}
    </div>
    <div className="text-xs font-black uppercase text-[#656565]">{label}</div>
    <div className="mt-1 text-2xl font-black text-black">{value}</div>
    <div className="mt-1 text-xs font-bold text-[#656565]">{hint}</div>
  </section>
);

const BarChart = ({ data = [], valueKey, labelKey = "period", money = false }) => {
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey] || 0)));
  return (
    <div className="h-72 rounded-3xl bg-[#f6f6f6] p-4">
      <div className="flex h-56 items-end gap-1 pb-2">
        {data.map((item, index) => {
          const value = Number(item[valueKey] || 0);
          const height = Math.max(6, Math.round((value / max) * 100));
          const labelInterval = Math.max(1, Math.ceil(data.length / 5));
          const showLabel = index === 0 || index === data.length - 1 || index % labelInterval === 0;

          return (
            <div key={item[labelKey]} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="group relative flex h-full w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-xl bg-black shadow-[0_10px_24px_rgba(0,0,0,0.16)] transition hover:bg-[#C0FF6B]"
                  style={{ height: `${height}%` }}
                />
                <div className="pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded-lg bg-black px-2 py-1 text-[11px] font-bold text-[#C0FF6B] group-hover:block">
                  {money ? fmt(value) : fmtNumber(value)}
                </div>
              </div>
              <div className="h-8 w-16 rotate-[-28deg] truncate text-[10px] font-bold text-[#656565]">
                {showLabel ? item[labelKey] : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HorizontalBars = ({ data = [], valueKey = "count", labelKey = "label", money = false }) => {
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey] || 0)));
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        return (
          <div key={item.status || item[labelKey]} className="rounded-2xl bg-[#f6f6f6] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-black text-black">{item[labelKey]}</span>
              <span className="text-xs font-black text-[#656565]">{money ? fmt(value) : fmtNumber(value)}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white">
              <div className="h-full rounded-full bg-[#C0FF6B]" style={{ width: `${Math.max(4, (value / max) * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AdminStatisticsPage = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [startDate, setStartDate] = useState(toInputDate(defaultStart));
  const [endDate, setEndDate] = useState(toInputDate(defaultEnd));
  const [groupBy, setGroupBy] = useState("day");
  const [data, setData] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("DELIVERED");
  const [loading, setLoading] = useState(true);

  const params = useMemo(() => ({ startDate, endDate, groupBy }), [startDate, endDate, groupBy]);

  const loadStatistics = async () => {
    if (!auth.isAuthenticated || auth.user.role !== "admin") return;
    setLoading(true);
    try {
      const res = await getAdminStatisticsApi(params);
      if (res?.EC === 0) {
        setData(res.DT);
        if (!res.DT.ordersByStatus?.[selectedStatus]) {
          setSelectedStatus(Object.keys(res.DT.ordersByStatus || {})[0] || "NEW");
        }
      }
    } catch (error) {
      message.error(error?.EM || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!auth.isAuthenticated) {
      navigate("/login");
      return;
    }
    if (auth.user.role !== "admin") {
      navigate("/");
      return;
    }
    loadStatistics();
  }, [auth.isAuthenticated, auth.user.role, params]);

  useEffect(() => {
    const refresh = () => loadStatistics();
    window.addEventListener("analytics-refresh", refresh);
    return () => window.removeEventListener("analytics-refresh", refresh);
  }, [auth.isAuthenticated, auth.user.role, params]);

  if (!auth.isAuthenticated || auth.user.role !== "admin") return null;

  const summary = data?.summary || {};
  const statusStats = data?.statusStats || [];
  const statusOptions = statusStats.map((item) => ({ value: item.status, label: item.label }));
  const selectedOrders = data?.ordersByStatus?.[selectedStatus] || [];

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black bg-[#C0FF6B] px-4 py-1 text-xs font-black uppercase text-black">
              <BarChartOutlined /> BT08 ANALYTICS
            </div>
            <h1 className="mt-3 text-3xl font-black text-black">Thống Kê Theo Thời Gian</h1>
            <p className="mt-1 max-w-3xl text-sm font-bold text-[#656565]">
              Theo dõi doanh thu, đơn theo trạng thái, dòng tiền đơn hàng, khách mới và top 10 sản phẩm bán nhiều nhất.
            </p>
          </div>

          <div className="grid gap-2 rounded-3xl border border-[#D5D5D5] bg-white p-3 shadow-sm sm:grid-cols-[150px_150px_140px_auto]">
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-xl border border-[#D5D5D5] px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
            />
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-xl border border-[#D5D5D5] px-3 py-2 text-sm font-bold text-black outline-none focus:border-black"
            />
            <Select
              value={groupBy}
              onChange={setGroupBy}
              options={[
                { value: "day", label: "Theo ngày" },
                { value: "month", label: "Theo tháng" },
              ]}
            />
            <button
              type="button"
              onClick={loadStatistics}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-black text-[#C0FF6B]"
            >
              <ReloadOutlined /> Làm mới
            </button>
          </div>
        </div>

        {loading && !data ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-3xl bg-white/80" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={<ShoppingOutlined />} label="Tổng đơn" value={fmtNumber(summary.totalOrders)} hint={`${fmtNumber(summary.newOrders)} đơn mới`} />
              <StatCard icon={<DollarOutlined />} label="Doanh thu đã giao" value={fmt(summary.revenue)} hint={`${fmtNumber(summary.deliveredOrders)} đơn đã giao`} />
              <StatCard icon={<WalletOutlined />} label="Tiền vào ví" value={fmt(summary.walletBalance)} hint="Chỉ ghi nhận khi đơn DELIVERED" />
              <StatCard icon={<FiTrendingUp />} label="Tiền đang xử lý" value={fmt(summary.processingMoney)} hint="Đơn chưa giao/chưa hủy" />
              <StatCard icon={<FiPackage />} label="Đơn đang giao" value={fmt(summary.shippingMoney)} hint="Tiền chưa đưa vào ví" />
              <StatCard icon={<DollarOutlined />} label="COD chờ thu" value={fmt(summary.codToCollect)} hint="Thu khi giao thành công" />
              <StatCard icon={<DollarOutlined />} label="MoMo chờ thanh toán" value={fmt(summary.momoPending)} hint="Link đã tạo, chưa thanh toán" />
              <StatCard icon={<TeamOutlined />} label="Khách mới" value={fmtNumber(summary.newCustomers)} hint="Tài khoản user mới trong kỳ" />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-black text-black">Biểu Đồ Doanh Thu</h2>
                  <span className="text-xs font-black uppercase text-[#656565]">{data?.range?.groupBy === "month" ? "Theo tháng" : "Theo ngày"}</span>
                </div>
                <BarChart data={data?.series || []} valueKey="revenue" money />
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black text-black">Đơn Theo Trạng Thái</h2>
                <HorizontalBars data={statusStats} valueKey="count" />
              </section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black text-black">Quản Lý Dòng Tiền</h2>
                <div className="grid gap-3">
                  {(data?.cashFlow || []).map((item) => (
                    <div key={item.key} className="rounded-2xl border border-[#D5D5D5] bg-[#f6f6f6] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-black text-black">{item.label}</div>
                          <div className="text-xs font-bold text-[#656565]">{item.description}</div>
                        </div>
                        <div className="text-right text-lg font-black text-black">{fmt(item.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-xl font-black text-black">Top 10 Sản Phẩm Bán Nhiều</h2>
                <div className="space-y-3">
                  {(data?.topProducts || []).map((product, index) => (
                    <div key={product._id || product.name} className="grid grid-cols-[42px_54px_1fr_auto] items-center gap-3 rounded-2xl bg-[#f6f6f6] p-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-black text-sm font-black text-[#C0FF6B]">#{index + 1}</div>
                      <img src={product.image || "https://via.placeholder.com/120x90?text=No+Image"} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                      <div className="min-w-0">
                        <div className="line-clamp-2 text-sm font-black text-black">{product.name}</div>
                        <div className="text-xs font-bold text-[#656565]">{fmt(product.revenue)} từ {fmtNumber(product.orderCount)} đơn</div>
                      </div>
                      <div className="text-right text-lg font-black text-black">{fmtNumber(product.quantity)}</div>
                    </div>
                  ))}
                  {!data?.topProducts?.length && (
                    <div className="rounded-2xl bg-[#f6f6f6] p-6 text-center text-sm font-bold text-[#656565]">Chưa có dữ liệu bán hàng.</div>
                  )}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-3xl border border-[#D5D5D5] bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-black text-black">Bảng Đơn Hàng Theo Trạng Thái</h2>
                  <p className="text-sm font-bold text-[#656565]">Mỗi trạng thái hiển thị tối đa 10 đơn mới nhất trong khoảng thời gian.</p>
                </div>
                <Select
                  className="min-w-64"
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  options={statusOptions}
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-left text-xs font-black uppercase text-[#656565]">
                      <th className="px-3 py-2">Mã đơn</th>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">Trạng thái</th>
                      <th className="px-3 py-2">Thanh toán</th>
                      <th className="px-3 py-2 text-right">Tổng tiền</th>
                      <th className="px-3 py-2 text-right">Số SP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrders.map((order) => (
                      <tr key={order._id} className="rounded-2xl bg-[#f6f6f6] text-sm font-bold text-black">
                        <td className="rounded-l-2xl px-3 py-3">#{order.orderCode}</td>
                        <td className="px-3 py-3">
                          <div>{order.user?.name || order.shippingAddress?.fullName}</div>
                          <div className="text-xs text-[#656565]">{order.shippingAddress?.phone}</div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${statusTone[order.status] || "bg-white text-black"}`}>
                            {data?.labels?.orderStatus?.[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">{order.paymentMethod} / {order.paymentStatus}</td>
                        <td className="px-3 py-3 text-right">{fmt(order.total)}</td>
                        <td className="rounded-r-2xl px-3 py-3 text-right">{fmtNumber(order.items?.length || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!selectedOrders.length && (
                  <div className="rounded-2xl bg-[#f6f6f6] p-8 text-center text-sm font-bold text-[#656565]">
                    Không có đơn trong trạng thái này.
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminStatisticsPage;

