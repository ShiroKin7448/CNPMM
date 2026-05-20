import {
  checkoutService,
  getOrdersService,
  getOrderDetailService,
  cancelOrderService,
  updateOrderStatusService,
  handleMomoReturnService,
  handleMomoIpnService,
  syncMomoPaymentService,
  getAdminOrdersService,
  getAdminDashboardService,
} from "../services/orderService.js";

const getUserId = (req) => req.user?.id;

export const checkout = async (req, res) => {
  const result = await checkoutService(getUserId(req), req.body);
  return res.status(result.EC === 0 ? 201 : 400).json(result);
};

export const getOrders = async (req, res) => {
  const result = await getOrdersService(getUserId(req));
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getOrderDetail = async (req, res) => {
  const result = await getOrderDetailService(getUserId(req), req.params.id);
  return res.status(result.EC === 0 ? 200 : 404).json(result);
};

export const cancelOrder = async (req, res) => {
  const result = await cancelOrderService(getUserId(req), req.params.id, req.body.reason);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const updateOrderStatus = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ EC: -1, EM: "Chỉ admin mới được cập nhật trạng thái đơn hàng", DT: null });
  }

  const result = await updateOrderStatusService(req.params.id, req.body.status, req.body.note);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const confirmMomoReturn = async (req, res) => {
  const result = await handleMomoReturnService(getUserId(req), req.body);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const momoIpn = async (req, res) => {
  const result = await handleMomoIpnService(req.body);
  if (result.EC === 0) return res.status(204).send();
  return res.status(400).json(result);
};

export const syncMomoPayment = async (req, res) => {
  const result = await syncMomoPaymentService(getUserId(req), req.params.id);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getAdminOrders = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ EC: -1, EM: "Chỉ admin mới được xem danh sách đơn hàng", DT: null });
  }

  const result = await getAdminOrdersService(req.query);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getAdminDashboard = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ EC: -1, EM: "Chỉ admin mới được xem dashboard", DT: null });
  }

  const result = await getAdminDashboardService();
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};
