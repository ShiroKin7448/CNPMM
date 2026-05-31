import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/product.js";

const parseQuantity = (value, fallback = 1) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : fallback;
};

const getUnitPrice = (product) => product.salePrice ?? product.price;

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildCartPayload = (cart) => {
  const rawItems = cart?.items || [];
  const items = rawItems
    .filter((item) => item.product && item.product.isActive !== false)
    .map((item) => {
      const product = item.product;
      const unitPrice = getUnitPrice(product);
      const quantity = item.quantity;
      return {
        product,
        quantity,
        unitPrice,
        lineTotal: unitPrice * quantity,
        inStock: product.stock >= quantity,
      };
    });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    items,
    subtotal,
    totalItems,
  };
};

const findCart = (userId) =>
  Cart.findOne({ user: userId })
    .populate("items.product", "name slug price salePrice images stock brand isActive")
    .lean();

const getOrCreateCart = async (userId) => {
  const existing = await Cart.findOne({ user: userId });
  if (existing) return existing;
  return Cart.create({ user: userId, items: [] });
};

export const getCartService = async (userId) => {
  try {
    const cart = await findCart(userId);
    return { EC: 0, EM: "Lấy giỏ hàng thành công", DT: buildCartPayload(cart) };
  } catch (error) {
    console.error("getCartService error:", error);
    return { EC: -1, EM: "Lỗi server khi lấy giỏ hàng", DT: null };
  }
};

export const addCartItemService = async (userId, { productId, quantity = 1 }) => {
  try {
    if (!isValidObjectId(productId)) {
      return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
    }

    const product = await Product.findOne({ _id: productId, isActive: true }).lean();
    if (!product) return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: null };
    if (product.stock <= 0) return { EC: 1, EM: "Sản phẩm đã hết hàng", DT: null };

    const qty = parseQuantity(quantity);
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((entry) => entry.product.toString() === productId);
    const nextQty = (item?.quantity || 0) + qty;

    if (nextQty > product.stock) {
      return {
        EC: 1,
        EM: `Chỉ còn ${product.stock} sản phẩm trong kho`,
        DT: null,
      };
    }

    if (item) item.quantity = nextQty;
    else cart.items.push({ product: productId, quantity: qty });

    await cart.save();
    const updated = await findCart(userId);
    return { EC: 0, EM: "Đã thêm sản phẩm vào giỏ hàng", DT: buildCartPayload(updated) };
  } catch (error) {
    console.error("addCartItemService error:", error);
    return { EC: -1, EM: "Lỗi server khi thêm giỏ hàng", DT: null };
  }
};

export const updateCartItemService = async (userId, productId, quantity) => {
  try {
    if (!isValidObjectId(productId)) {
      return { EC: 1, EM: "Sản phẩm không hợp lệ", DT: null };
    }

    const cart = await getOrCreateCart(userId);
    const item = cart.items.find((entry) => entry.product.toString() === productId);
    if (!item) return { EC: 1, EM: "Sản phẩm không có trong giỏ hàng", DT: null };

    const nextQty = Number(quantity);
    if (!Number.isFinite(nextQty) || nextQty < 1) {
      cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
    } else {
      const product = await Product.findOne({ _id: productId, isActive: true }).lean();
      if (!product) return { EC: 1, EM: "Không tìm thấy sản phẩm", DT: null };
      if (Math.floor(nextQty) > product.stock) {
        return { EC: 1, EM: `Chỉ còn ${product.stock} sản phẩm trong kho`, DT: null };
      }
      item.quantity = Math.floor(nextQty);
    }

    await cart.save();
    const updated = await findCart(userId);
    return { EC: 0, EM: "Cập nhật giỏ hàng thành công", DT: buildCartPayload(updated) };
  } catch (error) {
    console.error("updateCartItemService error:", error);
    return { EC: -1, EM: "Lỗi server khi cập nhật giỏ hàng", DT: null };
  }
};

export const removeCartItemService = async (userId, productId) => {
  try {
    const cart = await getOrCreateCart(userId);
    cart.items = cart.items.filter((entry) => entry.product.toString() !== productId);
    await cart.save();
    const updated = await findCart(userId);
    return { EC: 0, EM: "Đã xóa sản phẩm khỏi giỏ hàng", DT: buildCartPayload(updated) };
  } catch (error) {
    console.error("removeCartItemService error:", error);
    return { EC: -1, EM: "Lỗi server khi xóa sản phẩm khỏi giỏ hàng", DT: null };
  }
};

export const clearCartService = async (userId) => {
  try {
    await Cart.findOneAndUpdate({ user: userId }, { items: [] }, { upsert: true });
    return { EC: 0, EM: "Đã xóa toàn bộ giỏ hàng", DT: buildCartPayload(null) };
  } catch (error) {
    console.error("clearCartService error:", error);
    return { EC: -1, EM: "Lỗi server khi xóa giỏ hàng", DT: null };
  }
};
