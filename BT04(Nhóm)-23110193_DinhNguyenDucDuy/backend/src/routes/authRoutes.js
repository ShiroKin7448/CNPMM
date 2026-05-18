const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimit");
const { registerValidator } = require("../middleware/validator");
const { verifyToken } = require("../middleware/auth");

// Public routes
router.post("/register", loginLimiter, registerValidator, authCtrl.register);
router.post("/verify-otp", authCtrl.verifyOTP);
router.post("/login", loginLimiter, authCtrl.login);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

// Protected routes
router.get("/profile", verifyToken, authCtrl.getProfile);
router.put("/profile", verifyToken, authCtrl.updateProfile);

module.exports = router;
