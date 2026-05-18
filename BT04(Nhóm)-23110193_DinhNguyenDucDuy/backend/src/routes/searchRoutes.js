const router = require("express").Router();
const searchCtrl = require("../controllers/searchController");

router.get("/", searchCtrl.search);

module.exports = router;
