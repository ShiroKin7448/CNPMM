const FAQ = require("../models/FAQ");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatFAQ = (faq) => {
  const value = faq.toObject ? faq.toObject() : faq;
  return {
    ...value,
    id: value._id.toString(),
    updatedAt: value.updatedAt
      ? new Date(value.updatedAt).toISOString().slice(0, 10)
      : "",
  };
};

exports.listPublic = async (req, res) => {
  try {
    const { category, q } = req.query;
    const filter = { status: "Published" };

    if (category && category !== "All") {
      filter.category = category;
    }

    if (q?.trim()) {
      const regex = new RegExp(escapeRegex(q.trim()), "i");
      filter.$or = [{ question: regex }, { answer: regex }, { category: regex }];
    }

    const [faqs, categories] = await Promise.all([
      FAQ.find(filter).sort({ updatedAt: -1 }),
      FAQ.distinct("category", { status: "Published" }),
    ]);

    return res.json({
      faqs: faqs.map(formatFAQ),
      categories: ["All", ...categories.filter(Boolean).sort()],
    });
  } catch (err) {
    console.error("[faq:listPublic] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
