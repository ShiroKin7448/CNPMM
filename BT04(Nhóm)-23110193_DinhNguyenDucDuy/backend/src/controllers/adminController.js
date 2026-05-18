const Article = require("../models/Article");
const FAQ = require("../models/FAQ");

const resourceConfig = {
  articles: {
    model: Article,
    searchable: ["title", "topic", "status", "author", "excerpt", "body"],
    fields: ["title", "topic", "status", "author", "excerpt", "body", "faculty", "contentType", "views"],
  },
  faqs: {
    model: FAQ,
    searchable: ["question", "answer", "category", "status"],
    fields: ["question", "answer", "category", "status"],
  },
};

const getConfig = (resource) => resourceConfig[resource];

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const pickAllowedFields = (body, fields) =>
  fields.reduce((payload, field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
    return payload;
  }, {});

const formatDate = (value) =>
  value ? new Date(value).toISOString().slice(0, 10) : "";

const formatDoc = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id.toString(),
    updatedAt: formatDate(value.updatedAt || value.createdAt),
  };
};

const buildSearch = (fields, query) => {
  const keyword = query?.trim();
  if (!keyword) return {};

  const regex = new RegExp(escapeRegex(keyword), "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

exports.list = async (req, res) => {
  try {
    const { resource } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const filter = buildSearch(config.searchable, req.query.q);
    const rows = await config.model.find(filter).sort({ updatedAt: -1 });
    return res.json({ data: rows.map(formatDoc) });
  } catch (err) {
    console.error("[admin:list] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { resource } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const payload = pickAllowedFields(req.body, config.fields);
    const created = await config.model.create(payload);
    return res.status(201).json(formatDoc(created));
  } catch (err) {
    console.error("[admin:create] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const payload = pickAllowedFields(req.body, config.fields);
    const updated = await config.model.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    return res.json(formatDoc(updated));
  } catch (err) {
    console.error("[admin:update] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { resource, id } = req.params;
    const config = getConfig(resource);

    if (!config) {
      return res.status(404).json({ message: "Resource không tồn tại" });
    }

    const removed = await config.model.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ message: "Không tìm thấy bản ghi" });
    }

    return res.json({ message: "Đã xóa thành công", id });
  } catch (err) {
    console.error("[admin:remove] server error", err);
    return res.status(500).json({ message: "Lỗi server", details: err.message });
  }
};
