const Article = require("../models/Article");
const FAQ = require("../models/FAQ");
const ForumThread = require("../models/ForumThread");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPublishTime = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const day = 24 * 60 * 60 * 1000;

  if (diff <= day) return "Last 24 hours";
  if (diff <= 7 * day) return "Last 7 days";
  if (diff <= 30 * day) return "Last 30 days";
  return "All";
};

const getPopularity = (views = 0) => {
  if (views >= 3000) return "High";
  if (views >= 1000) return "Medium";
  return "Low";
};

const matchesFilter = (item, filters) => {
  const exactFilters = [
    ["topic", "topic"],
    ["faculty", "faculty"],
    ["contentType", "contentType"],
    ["popularity", "popularity"],
    ["counselingFormat", "counselingFormat"],
    ["appointmentStatus", "appointmentStatus"],
  ];

  const matchesExact = exactFilters.every(([queryKey, itemKey]) => {
    const value = filters[queryKey];
    return !value || value === "All" || item[itemKey] === value;
  });

  if (!matchesExact) return false;

  return (
    !filters.publishTime ||
    filters.publishTime === "All" ||
    item.publishTime === filters.publishTime
  );
};

exports.search = async (req, res) => {
  try {
    const keyword = req.query.keyword || req.query.q || "";
    const hasKeyword = keyword.trim().length > 0;
    const regex = hasKeyword ? new RegExp(escapeRegex(keyword.trim()), "i") : null;

    const [articles, faqs, threads] = await Promise.all([
      Article.find({
        status: "Published",
        ...(regex
          ? {
              $or: [
                { title: regex },
                { excerpt: regex },
                { body: regex },
                { topic: regex },
                { author: regex },
              ],
            }
          : {}),
      })
        .sort({ updatedAt: -1 })
        .limit(25),
      FAQ.find({
        status: "Published",
        ...(regex
          ? {
              $or: [{ question: regex }, { answer: regex }, { category: regex }],
            }
          : {}),
      })
        .sort({ updatedAt: -1 })
        .limit(25),
      ForumThread.find(
        regex
          ? {
              $or: [{ title: regex }, { content: regex }, { tags: regex }],
            }
          : {},
      )
        .sort({ pinned: -1, updatedAt: -1 })
        .limit(25),
    ]);

    const articleResults = articles.map((article) => ({
      id: `article-${article._id}`,
      title: article.title,
      excerpt: article.excerpt || article.body?.replace(/<[^>]*>/g, "").slice(0, 160) || "",
      topic: article.topic,
      faculty: article.faculty || article.author || "HCMUTE",
      contentType: "Article",
      publishTime: getPublishTime(article.createdAt),
      popularity: getPopularity(article.views),
      counselingFormat: "All",
      appointmentStatus: "All",
      type: "article",
      refId: article._id.toString(),
      views: article.views || 0,
    }));

    const faqResults = faqs.map((faq) => ({
      id: `faq-${faq._id}`,
      title: faq.question,
      excerpt: faq.answer,
      topic: faq.category,
      faculty: "Student Support Center",
      contentType: "FAQ",
      publishTime: getPublishTime(faq.createdAt),
      popularity: "Medium",
      counselingFormat: "All",
      appointmentStatus: "All",
      type: "faq",
      refId: faq._id.toString(),
      views: 0,
    }));

    const forumResults = threads.map((thread) => ({
      id: `forum-${thread._id}`,
      title: thread.title,
      excerpt: thread.content,
      topic: thread.tags?.[0] || "Forum",
      faculty: "Community",
      contentType: "Forum",
      publishTime: getPublishTime(thread.createdAt),
      popularity: getPopularity((thread.votes || 0) * 100),
      counselingFormat: "All",
      appointmentStatus: thread.solved ? "Completed" : "Pending",
      type: "forum",
      refId: thread._id.toString(),
      views: thread.votes || 0,
    }));

    const results = [...articleResults, ...faqResults, ...forumResults].filter((item) =>
      matchesFilter(item, req.query),
    );

    return res.json({ results, total: results.length });
  } catch (err) {
    console.error("[search] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
