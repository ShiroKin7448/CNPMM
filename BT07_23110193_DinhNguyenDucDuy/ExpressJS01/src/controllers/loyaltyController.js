import {
  createVoucherService,
  getAdminLoyaltyService,
  getMyStoreService,
  getPromotionsService,
  recordRecentlyViewedService,
  toggleFavoriteService,
} from "../services/loyaltyService.js";

const getUserId = (req) => req.user?.id;
const isAdmin = (req) => req.user?.role === "admin";

export const getPromotions = async (req, res) => {
  const result = await getPromotionsService(getUserId(req));
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getMyStore = async (req, res) => {
  const result = await getMyStoreService(getUserId(req));
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const toggleFavorite = async (req, res) => {
  const result = await toggleFavoriteService(getUserId(req), req.params.productId);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const recordRecentlyViewed = async (req, res) => {
  const result = await recordRecentlyViewedService(getUserId(req), req.params.productId);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getAdminLoyalty = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ EC: 1, EM: "Chỉ admin mới được xem kho ưu đãi", DT: null });
  const result = await getAdminLoyaltyService();
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const createVoucher = async (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ EC: 1, EM: "Chỉ admin mới được tạo mã giảm giá", DT: null });
  const result = await createVoucherService(req.body);
  return res.status(result.EC === 0 ? 201 : 400).json(result);
};
