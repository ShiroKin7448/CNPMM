import {
  getProductsService,
  getProductDetailService,
  getSimilarProductsService,
  getCategoriesService,
  getHomeProductsService,
  createProductService,
  updateProductService,
  deleteProductService,
} from "../services/productService.js";

// GET /v1/api/products?search=&category=&brand=&tag=&minPrice=&maxPrice=&sort=&page=&limit=
export const getProducts = async (req, res) => {
  try {
    const result = await getProductsService(req.query);
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// GET /v1/api/products/home
export const getHomeProducts = async (req, res) => {
  try {
    const result = await getHomeProductsService();
    return res.status(result.EC === 0 ? 200 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// GET /v1/api/products/similar/:id
export const getSimilarProducts = async (req, res) => {
  try {
    const result = await getSimilarProductsService(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
  }
};

// GET /v1/api/products/:id
export const getProductDetail = async (req, res) => {
  try {
    const result = await getProductDetailService(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// GET /v1/api/categories
export const getCategories = async (req, res) => {
  try {
    const result = await getCategoriesService();
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: [] });
  }
};

// POST /v1/api/products (admin)
export const createProduct = async (req, res) => {
  try {
    const result = await createProductService(req.body);
    return res.status(result.EC === 0 ? 201 : 400).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// PUT /v1/api/products/:id (admin)
export const updateProduct = async (req, res) => {
  try {
    const result = await updateProductService(req.params.id, req.body);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};

// DELETE /v1/api/products/:id (admin)
export const deleteProduct = async (req, res) => {
  try {
    const result = await deleteProductService(req.params.id);
    return res.status(result.EC === 0 ? 200 : 404).json(result);
  } catch (error) {
    return res.status(500).json({ EC: -1, EM: "Lỗi server", DT: null });
  }
};
