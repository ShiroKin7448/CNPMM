import Product from "../models/product.js";
import Category from "../models/category.js";
import { applyProductImages } from "../data/productImages.js";
import { notifyNewProduct } from "./notificationService.js";

const categoryColors = {
  "laptop-gaming": "#000000",
  "laptop-van-phong": "#656565",
  macbook: "#C0FF6B",
  "phu-kien": "#000000",
};

const applyCategoryPalette = (category) => {
  if (!category) return category;
  return { ...category, color: categoryColors[category.slug] || category.color };
};

const decorateProduct = (product) => {
  const themed = applyProductImages(product);
  if (!themed) return themed;
  const normalized = {
    ...themed,
    viewCount: themed.viewCount ?? 0,
    buyerCount: themed.buyerCount ?? 0,
    commentCustomerCount: themed.commentCustomerCount ?? 0,
  };
  return normalized.category
    ? { ...normalized, category: applyCategoryPalette(normalized.category) }
    : normalized;
};

const decorateProducts = (products = []) => products.map(decorateProduct);

const cleanText = (value = "") => value.toString().trim();
const runNotification = (promise) => {
  if (promise?.catch) promise.catch((error) => console.error("notification error:", error));
};
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const parsePrice = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const parsePageNumber = (value, fallback = 1) =>
  Math.max(1, parseInt(value, 10) || fallback);
const parseLimitNumber = (value, fallback = 12, max = 50) =>
  Math.min(max, Math.max(1, parseInt(value, 10) || fallback));

// =====================
// Helper: táº¡o slug tá»« tÃªn
// =====================
export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[Ä‘Ä]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// =====================
// GET /v1/api/products â€” danh sÃ¡ch + search + filter + sort + pagination
// =====================
export const getProductsService = async (query) => {
  try {
    const {
      search = "",
      category = "",
      brand = "",
      tag = "",
      minPrice = 0,
      maxPrice = 999999999,
      sort = "newest",
      page = 1,
      limit = 12,
    } = query;

    const filter = { isActive: true };
    const searchText = cleanText(search);
    const categorySlug = cleanText(category);
    const brandText = cleanText(brand);
    const tagText = cleanText(tag);

    // TÃ¬m kiáº¿m text
    if (searchText) {
      const searchPattern = escapeRegex(searchText);
      filter.$or = [
        { name: { $regex: searchPattern, $options: "i" } },
        { description: { $regex: searchPattern, $options: "i" } },
        { brand: { $regex: searchPattern, $options: "i" } },
      ];
    }

    // Filter theo category slug
    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (!cat) {
        return {
          EC: 0,
          EM: "Láº¥y danh sÃ¡ch sáº£n pháº©m thÃ nh cÃ´ng",
          DT: {
            products: [],
            pagination: { page: 1, limit: Number(limit) || 12, total: 0, totalPages: 0 },
          },
        };
      }
      filter.category = cat._id;
    }

    // Filter theo brand
    if (brandText) filter.brand = { $regex: `^${escapeRegex(brandText)}$`, $options: "i" };

    // Filter theo tag
    if (tagText) filter.tags = { $in: [tagText] };

    // Filter theo giÃ¡ (dÃ¹ng salePrice náº¿u cÃ³, ngÆ°á»£c láº¡i dÃ¹ng price)
    const priceMin = Math.max(0, parsePrice(minPrice, 0));
    const priceMax = Math.max(priceMin, parsePrice(maxPrice, 999999999));
    filter.$expr = {
      $and: [
        {
          $gte: [
            { $ifNull: ["$salePrice", "$price"] },
            priceMin,
          ],
        },
        {
          $lte: [
            { $ifNull: ["$salePrice", "$price"] },
            priceMax,
          ],
        },
      ],
    };

    // Sort
    let sortObj = {};
    switch (sort) {
      case "price_asc":
        sortObj = { price: 1 };
        break;
      case "price_desc":
        sortObj = { price: -1 };
        break;
      case "best-selling":
        sortObj = { sold: -1 };
        break;
      case "most-viewed":
        sortObj = { viewCount: -1, sold: -1 };
        break;
      case "rating":
        sortObj = { rating: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
    }

    const pageNum = parsePageNumber(page);
    const limitNum = parseLimitNumber(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug color icon")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      EC: 0,
      EM: "Láº¥y danh sÃ¡ch sáº£n pháº©m thÃ nh cÃ´ng",
      DT: {
        products: decorateProducts(products),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    };
  } catch (error) {
    console.error("getProductsService error:", error);
    return { EC: -1, EM: "Lá»—i server khi láº¥y sáº£n pháº©m", DT: null };
  }
};

// =====================
// GET /v1/api/products/:id â€” chi tiáº¿t sáº£n pháº©m
// =====================
export const getProductDetailService = async (id) => {
  try {
    const product = await Product.findOneAndUpdate(
      { _id: id, isActive: true },
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate("category", "name slug color icon")
      .lean();

    if (!product) {
      return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m", DT: null };
    }

    return { EC: 0, EM: "Láº¥y chi tiáº¿t sáº£n pháº©m thÃ nh cÃ´ng", DT: decorateProduct(product) };
  } catch (error) {
    console.error("getProductDetailService error:", error);
    return { EC: -1, EM: "Lá»—i server khi láº¥y chi tiáº¿t sáº£n pháº©m", DT: null };
  }
};

// =====================
// GET /v1/api/products/similar/:id â€” sáº£n pháº©m tÆ°Æ¡ng tá»±
// =====================
export const getSimilarProductsService = async (id) => {
  try {
    const product = await Product.findById(id).lean();
    if (!product) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m", DT: [] };

    const similar = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
    })
      .populate("category", "name slug color icon")
      .limit(8)
      .sort({ sold: -1 })
      .lean();

    return { EC: 0, EM: "Láº¥y sáº£n pháº©m tÆ°Æ¡ng tá»± thÃ nh cÃ´ng", DT: decorateProducts(similar) };
  } catch (error) {
    console.error("getSimilarProductsService error:", error);
    return { EC: -1, EM: "Lá»—i server", DT: [] };
  }
};

// =====================
// GET /v1/api/categories â€” danh sÃ¡ch danh má»¥c
// =====================
export const getCategoriesService = async () => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return {
      EC: 0,
      EM: "Láº¥y danh sÃ¡ch danh má»¥c thÃ nh cÃ´ng",
      DT: categories.map(applyCategoryPalette),
    };
  } catch (error) {
    console.error("getCategoriesService error:", error);
    return { EC: -1, EM: "Lá»—i server", DT: [] };
  }
};

// =====================
// GET /v1/api/products/home â€” láº¥y sp cho trang chá»§
// =====================
export const getHomeProductsService = async () => {
  try {
    const [sale, newest, bestSeller, featured] = await Promise.all([
      Product.find({ tags: "sale", isActive: true })
        .populate("category", "name slug color icon")
        .sort({ sold: -1 })
        .limit(8)
        .lean(),
      Product.find({ tags: "new", isActive: true })
        .populate("category", "name slug color icon")
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      Product.find({ tags: "best-seller", isActive: true })
        .populate("category", "name slug color icon")
        .sort({ sold: -1 })
        .limit(8)
        .lean(),
      Product.find({ tags: "featured", isActive: true })
        .populate("category", "name slug color icon")
        .limit(4)
        .lean(),
    ]);

    return {
      EC: 0,
      EM: "Láº¥y dá»¯ liá»‡u trang chá»§ thÃ nh cÃ´ng",
      DT: {
        sale: decorateProducts(sale),
        newest: decorateProducts(newest),
        bestSeller: decorateProducts(bestSeller),
        featured: decorateProducts(featured),
      },
    };
  } catch (error) {
    console.error("getHomeProductsService error:", error);
    return { EC: -1, EM: "Lá»—i server", DT: null };
  }
};

// =====================
// GET /v1/api/products/top â€” top 10 bÃ¡n cháº¡y hoáº·c xem nhiá»u
// =====================
export const getTopProductsService = async (query = {}) => {
  try {
    const { type = "best-selling", page = 1, limit = 10 } = query;
    const rankingType = cleanText(type);
    const sortMap = {
      "best-selling": { sold: -1, createdAt: -1 },
      "most-viewed": { viewCount: -1, sold: -1, createdAt: -1 },
    };
    const sortObj = sortMap[rankingType];

    if (!sortObj) {
      return {
        EC: 1,
        EM: "Loáº¡i xáº¿p háº¡ng khÃ´ng há»£p lá»‡",
        DT: null,
      };
    }

    const pageNum = parsePageNumber(page);
    const limitNum = parseLimitNumber(limit, 10, 10);
    const activeTotal = await Product.countDocuments({ isActive: true });
    const topTotal = Math.min(activeTotal, 10);
    const skip = (pageNum - 1) * limitNum;
    const cappedLimit = Math.max(0, Math.min(limitNum, topTotal - skip));

    const products = cappedLimit > 0
      ? await Product.find({ isActive: true })
        .populate("category", "name slug color icon")
        .sort(sortObj)
        .skip(skip)
        .limit(cappedLimit)
        .lean()
      : [];

    return {
      EC: 0,
      EM: "Láº¥y danh sÃ¡ch top sáº£n pháº©m thÃ nh cÃ´ng",
      DT: {
        type: rankingType,
        products: decorateProducts(products),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: topTotal,
          totalPages: Math.ceil(topTotal / limitNum),
        },
      },
    };
  } catch (error) {
    console.error("getTopProductsService error:", error);
    return { EC: -1, EM: "Lá»—i server khi láº¥y top sáº£n pháº©m", DT: null };
  }
};

// =====================
// POST /v1/api/products â€” táº¡o sáº£n pháº©m má»›i (admin)
// =====================
export const createProductService = async (data) => {
  try {
    const slug = slugify(data.name) + "-" + Date.now();
    const product = await Product.create({ ...data, slug });
    runNotification(notifyNewProduct(product));
    return { EC: 0, EM: "Táº¡o sáº£n pháº©m thÃ nh cÃ´ng", DT: product };
  } catch (error) {
    console.error("createProductService error:", error);
    return { EC: -1, EM: "Lá»—i server khi táº¡o sáº£n pháº©m", DT: null };
  }
};

// =====================
// PUT /v1/api/products/:id â€” cáº­p nháº­t sáº£n pháº©m (admin)
// =====================
export const updateProductService = async (id, data) => {
  try {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m", DT: null };
    return { EC: 0, EM: "Cáº­p nháº­t sáº£n pháº©m thÃ nh cÃ´ng", DT: product };
  } catch (error) {
    console.error("updateProductService error:", error);
    return { EC: -1, EM: "Lá»—i server khi cáº­p nháº­t sáº£n pháº©m", DT: null };
  }
};

// =====================
// DELETE /v1/api/products/:id â€” xÃ³a sáº£n pháº©m (admin)
// =====================
export const deleteProductService = async (id) => {
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!product) return { EC: 1, EM: "KhÃ´ng tÃ¬m tháº¥y sáº£n pháº©m", DT: null };
    return { EC: 0, EM: "XÃ³a sáº£n pháº©m thÃ nh cÃ´ng", DT: null };
  } catch (error) {
    console.error("deleteProductService error:", error);
    return { EC: -1, EM: "Lá»—i server khi xÃ³a sáº£n pháº©m", DT: null };
  }
};
