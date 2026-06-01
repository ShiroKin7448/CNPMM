const express = require("express");
const router = express.Router();
const counselorController = require("../controllers/counselorController");
const { verifyToken } = require("../middleware/auth");

// Public routes
router.get("/", counselorController.getAllCounselors);
router.get("/:id/available-slots", counselorController.getAvailableSlots);
router.get("/:id/similar", counselorController.getSimilarCounselors);
router.get("/:id/stats", counselorController.getCounselorStats);
router.get("/:id/reviews", counselorController.getCounselorReviews);
router.get("/:id", counselorController.getCounselorById);

// Protected routes
router.post("/", verifyToken, counselorController.createCounselor);
router.put("/:id", verifyToken, counselorController.updateCounselor);

module.exports = router;
