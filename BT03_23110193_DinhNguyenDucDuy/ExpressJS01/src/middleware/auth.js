import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Danh sách các route không cần xác thực
const WHITE_LIST = ["/", "/v1/api/register", "/v1/api/login", "/v1/api/forgot-password"];

const checkAuth = (req, res, next) => {
  // Bỏ qua middleware cho các route public
  if (WHITE_LIST.includes(req.path)) {
    return next();
  }

  // Lấy token từ header Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      EC: -1,
      EM: "Unauthorized - No token provided",
      DT: null,
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Đính kèm thông tin user vào request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        EC: -1,
        EM: "Unauthorized - Token has expired",
        DT: null,
      });
    }
    return res.status(401).json({
      EC: -1,
      EM: "Unauthorized - Invalid token",
      DT: null,
    });
  }
};

export default checkAuth;
