import {
  getCartService,
  addCartItemService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
} from "../services/cartService.js";

const getUserId = (req) => req.user?.id;

export const getCart = async (req, res) => {
  const result = await getCartService(getUserId(req));
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const addCartItem = async (req, res) => {
  const result = await addCartItemService(getUserId(req), req.body);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const updateCartItem = async (req, res) => {
  const result = await updateCartItemService(getUserId(req), req.params.productId, req.body.quantity);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const removeCartItem = async (req, res) => {
  const result = await removeCartItemService(getUserId(req), req.params.productId);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const clearCart = async (req, res) => {
  const result = await clearCartService(getUserId(req));
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};
