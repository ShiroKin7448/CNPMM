const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const { verifyToken, authorize } = require("../middleware/auth");

router.post(
  "/edit-profile",
  verifyToken,
  authorize("user"),
  authCtrl.editProfile,
);

module.exports = router;
