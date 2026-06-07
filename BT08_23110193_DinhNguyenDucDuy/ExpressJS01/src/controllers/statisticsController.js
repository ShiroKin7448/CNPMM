import { getAdminStatisticsService } from "../services/statisticsService.js";

export const getAdminStatistics = async (req, res) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ EC: -1, EM: "Chi admin moi duoc xem thong ke", DT: null });
  }

  const result = await getAdminStatisticsService(req.query);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};
