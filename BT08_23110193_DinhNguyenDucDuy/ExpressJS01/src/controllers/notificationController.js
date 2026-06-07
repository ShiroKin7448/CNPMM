import {
  getNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../services/notificationService.js";

export const getNotifications = async (req, res) => {
  const result = await getNotificationsService(req.user, req.query);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const markNotificationRead = async (req, res) => {
  const result = await markNotificationReadService(req.user, req.params.id);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const markAllNotificationsRead = async (req, res) => {
  const result = await markAllNotificationsReadService(req.user);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};
