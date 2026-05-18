const router = require("express").Router();
const forumCtrl = require("../controllers/forumController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/threads", forumCtrl.listThreads);
router.get("/threads/:id", forumCtrl.getThread);
router.post("/threads", verifyToken, forumCtrl.createThread);
router.post("/threads/:id/replies", verifyToken, forumCtrl.createReply);
router.patch("/threads/:id/upvote", verifyToken, forumCtrl.upvoteThread);
router.patch("/threads/:id/solved", verifyToken, forumCtrl.toggleSolved);

router.patch("/threads/:id/pin", verifyToken, verifyAdmin, forumCtrl.togglePin);
router.delete("/threads/:id", verifyToken, verifyAdmin, forumCtrl.deleteThread);
router.delete(
  "/threads/:id/replies/:replyId",
  verifyToken,
  verifyAdmin,
  forumCtrl.deleteReply,
);

module.exports = router;
