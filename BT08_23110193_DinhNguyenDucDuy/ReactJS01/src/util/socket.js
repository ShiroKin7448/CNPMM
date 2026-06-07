import { io } from "socket.io-client";

let socket = null;

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
  return apiUrl.replace(/\/+$/, "");
};

export const connectSocket = (token) => {
  if (socket?.connected) return socket;
  if (socket) socket.disconnect();

  socket = io(getSocketUrl(), {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnectionAttempts: 5,
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
