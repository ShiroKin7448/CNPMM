import Product from "../models/product.js";
import Category from "../models/category.js";

// =====================
// Helper: tạo slug từ tên
// =====================
export const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// =====================
// GET /v1/api/products — danh sách + search + filter + sort + pagination
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

    // Tìm kiếm text
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }

    // Filter theo category slug
    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) filter.category = cat._id;
    }

    // Filter theo brand
    if (brand) filter.brand = { $regex: brand, $options: "i" };

    // Filter theo tag
    if (tag) filter.tags = { $in: [tag] };

    // Filter theo giá (dùng salePrice nếu có, ngược lại dùng price)
    const priceMin = Number(minPrice);
    const priceMax = Number(maxPrice);
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
      case "rating":
        sortObj = { rating: -1 };
        break;
      case "newest":
      default:
        sortObj = { createdAt: -1 };
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
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
      EM: "Lấy danh sách sản phẩm thành công",
      DT: {
        products,
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
    return { EC: -1, EM: "Lỗi server khi lấy sản phẩm", DT: null };
  }
};

// =====================
// GET /v1/api/products/:id — chi tiết sản phẩm
// =====================
export const getProductDetailService = async (id) => {
  try {
    const product = await Product.findOne({ _id: id, isActive: true })
      .populate("category", "name slug color icon")
      .lean();

    if (!product) {
      return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: null };
    }

    return { EC: 0, EM: "Lấy chi tiết sản phẩm thành công", DT: product };
  } catch (error) {
    console.error("getProductDetailService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy chi tiết sản phẩm", DT: null };
  }
};

// =====================
// GET /v1/api/products/similar/:id — sản phẩm tương tự
// =====================
export const getSimilarProductsService = async (id) => {
  try {
    const product = await Product.findById(id).lean();
    if (!product) return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: [] };

    const similar = await Product.find({
      _id: { $ne: id },
      category: product.category,
      isActive: true,
    })
      .populate("category", "name slug color icon")
      .limit(8)
      .sort({ sold: -1 })
      .lean();

    return { EC: 0, EM: "Lấy sản phẩm tương tự thành công", DT: similar };
  } catch (error) {
    console.error("getSimilarProductsService error:", error);
    return { EC: -1, EM: "Lỗi server", DT: [] };
  }
};

// =====================
// GET /v1/api/categories — danh sách danh mục
// =====================
export const getCategoriesService = async () => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();

    return {
      EC: 0,
      EM: "Lấy danh sách danh mục thành công",
      DT: categories,
    };
  } catch (error) {
    console.error("getCategoriesService error:", error);
    return { EC: -1, EM: "Lỗi server", DT: [] };
  }
};

// =====================
// GET /v1/api/products/home — lấy sp cho trang chủ
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
      EM: "Lấy dữ liệu trang chủ thành công",
      DT: { sale, newest, bestSeller, featured },
    };
  } catch (error) {
    console.error("getHomeProductsService error:", error);
    return { EC: -1, EM: "Lỗi server", DT: null };
  }
};

// =====================
// POST /v1/api/products — tạo sản phẩm mới (admin)
// =====================
export const createProductService = async (data) => {
  try {
    const slug = slugify(data.name) + "-" + Date.now();
    const product = await Product.create({ ...data, slug });
    return { EC: 0, EM: "Tạo sản phẩm thành công", DT: product };
  } catch (error) {
    console.error("createProductService error:", error);
    return { EC: -1, EM: "Lỗi server khi tạo sản phẩm", DT: null };
  }
};

// =====================
// PUT /v1/api/products/:id — cập nhật sản phẩm (admin)
// =====================
export const updateProductService = async (id, data) => {
  try {
    const product = await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name slug");

    if (!product) return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: null };
    return { EC: 0, EM: "Cập nhật sản phẩm thành công", DT: product };
  } catch (error) {
    console.error("updateProductService error:", error);
    return { EC: -1, EM: "Lỗi server khi cập nhật sản phẩm", DT: null };
  }
};

// =====================
// DELETE /v1/api/products/:id — xóa sản phẩm (admin)
// =====================
export const deleteProductService = async (id) => {
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!product) return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: null };
    return { EC: 0, EM: "Xóa sản phẩm thành công", DT: null };
  } catch (error) {
    console.error("deleteProductService error:", error);
    return { EC: -1, EM: "Lỗi server khi xóa sản phẩm", DT: null };
  }
};
