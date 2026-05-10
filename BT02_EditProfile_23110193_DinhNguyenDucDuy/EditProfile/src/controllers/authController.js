const User = require("../models/User");

// --- CHỈNH SỬA PROFILE ---
exports.editProfile = async (req, res) => {
  try {
    const { username } = req.body;
    await User.findByIdAndUpdate(req.user.id, { username });
    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Không thể cập nhật profile" });
  }
};
