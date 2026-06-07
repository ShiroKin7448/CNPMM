import jwt from "jsonwebtoken";
import { Server } from "socket.io";

let io = null;

const normalizeOrigins = (origins = []) => origins.filter(Boolean);

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const queryToken = socket.handshake.query?.token;
  const bearer = socket.handshake.headers?.authorization;
  if (authToken) return authToken;
  if (queryToken) return queryToken;
  if (bearer?.startsWith("Bearer ")) return bearer.slice(7);
  return "";
};

const serializeNotification = (notification) => {
  const plain = typeof notification.toObject === "function"
    ? notification.toObject()
    : notification;
  return {
    ...plain,
    _id: plain._id?.toString?.() || plain._id,
    recipient: plain.recipient?.toString?.() || plain.recipient || null,
  };
};

export const initSocketServer = (httpServer, allowedOrigins = []) => {
  io = new Server(httpServer, {
    cors: {
      origin: normalizeOrigins(allowedOrigins),
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = getTokenFromSocket(socket);
    if (!token) return next();

    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      socket.user = null;
    }
    return next();
  });

  io.on("connection", (socket) => {
    const user = socket.user;
    if (user?.id) {
      socket.join(`user:${user.id}`);
      socket.join(`role:${user.role || "user"}`);
    }

    socket.emit("socket:ready", {
      connected: true,
      userId: user?.id || null,
      role: user?.role || null,
      at: new Date(),
    });
  });

  return io;
};

export const emitNotification = (notification) => {
  if (!io || !notification) return;
  const payload = serializeNotification(notification);

  if (payload.recipient) {
    io.to(`user:${payload.recipient}`).emit("notification:new", payload);
  }

  if (payload.audience === "admin") {
    io.to("role:admin").emit("notification:new", payload);
    io.to("role:admin").emit("analytics:refresh", { reason: payload.type, at: new Date() });
  } else if (payload.audience === "user") {
    io.to("role:user").emit("notification:new", payload);
  } else if (payload.audience === "all") {
    io.emit("notification:new", payload);
    io.to("role:admin").emit("analytics:refresh", { reason: payload.type, at: new Date() });
  }
};

export const emitAdminAnalyticsRefresh = (reason = "manual") => {
  if (!io) return;
  io.to("role:admin").emit("analytics:refresh", { reason, at: new Date() });
};

export const getSocketServer = () => io;
