const router = require("express").Router();
const adminCtrl = require("../controllers/adminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.use(verifyToken, verifyAdmin);

router.get("/:resource", adminCtrl.list);
router.post("/:resource", adminCtrl.create);
router.put("/:resource/:id", adminCtrl.update);
router.delete("/:resource/:id", adminCtrl.remove);

module.exports = router;
