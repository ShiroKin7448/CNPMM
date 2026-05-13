import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connection from "./config/database.js";
import configViewEngine from "./config/viewEngine.js";
import apiRouter from "./routes/api.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// =====================
// Middleware
// =====================

// CORS - cho phép frontend gọi API
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
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

// Route mặc định - kiểm tra server
app.get("/", (req, res) => {
  res.json({
    EC: 0,
    EM: "Server đang hoạt động!",
    DT: {
      name: "BT04 - FullStack API + E-Commerce",
      version: "1.0.0",
      author: "23110193 - Đinh Nguyễn Đức Duy",
    },
  });
});

// API Routes - tiền tố /v1/api/
app.use("/v1/api", apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    EC: -1,
    EM: "Route không tồn tại",
    DT: null,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);
  res.status(500).json({
    EC: -1,
    EM: "Lỗi server nội bộ",
    DT: null,
  });
});

// =====================
// Khởi động server
// =====================
const startServer = async () => {
  await connection(); // Kết nối MongoDB
  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    console.log(`📦 MongoDB URL: ${process.env.MONGO_DB_URL}`);
    console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
  });
};

startServer();
