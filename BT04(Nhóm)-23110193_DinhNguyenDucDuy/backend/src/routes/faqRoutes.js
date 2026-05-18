const router = require("express").Router();
const faqCtrl = require("../controllers/faqController");

router.get("/", faqCtrl.listPublic);

module.exports = router;
