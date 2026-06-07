import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import connection from "./config/database.js";
import configViewEngine from "./config/viewEngine.js";
import apiRouter from "./routes/api.js";
import { startMomoPendingPaymentSweeper } from "./services/orderService.js";
import { initSocketServer } from "./services/socketService.js";

// Load environment variables
dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 8080;
const defaultAllowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];
const allowedOrigins = Array.from(new Set([
  ...defaultAllowedOrigins,
  ...(process.env.FRONTEND_URL || "").split(","),
].map((origin) => origin.trim()).filter(Boolean)));

// =====================
// Middleware
// =====================

// CORS - cho phÃ©p frontend gá»i API
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View Engine (EJS)
configViewEngine(app);

// =====================
// Routes
// =====================

// Route máº·c Ä‘á»‹nh - kiá»ƒm tra server
app.get("/", (req, res) => {
  res.json({
    EC: 0,
    EM: "Server Ä‘ang hoáº¡t Ä‘á»™ng!",
    DT: {
      name: "BT08 - LaptopStore Realtime Notification & Analytics API",
      version: "1.0.0",
      author: "23110193 - Äinh Nguyá»…n Äá»©c Duy",
    },
  });
});

// API Routes - tiá»n tá»‘ /v1/api/
app.use("/v1/api", apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    EC: -1,
    EM: "Route khÃ´ng tá»“n táº¡i",
    DT: null,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    EC: -1,
    EM: "Lá»—i server ná»™i bá»™",
    DT: null,
  });
});

// =====================
// Khá»Ÿi Ä‘á»™ng server
// =====================
const startServer = async () => {
  await connection(); // Káº¿t ná»‘i MongoDB
  initSocketServer(httpServer, allowedOrigins);
  httpServer.listen(PORT, () => {
    console.log(`ðŸš€ Server Ä‘ang cháº¡y táº¡i http://localhost:${PORT}`);
    console.log(`ðŸ“¦ MongoDB URL: ${process.env.MONGO_DB_URL}`);
    console.log(`ðŸŒ Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log("Realtime socket.io ready");
  });
  startMomoPendingPaymentSweeper();
};

startServer();

