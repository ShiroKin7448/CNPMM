import {
  createReviewService,
  getProductReviewsService,
  getReviewEligibilityService,
} from "../services/reviewService.js";

const getUserId = (req) => req.user?.id;

export const getProductReviews = async (req, res) => {
  const result = await getProductReviewsService(req.params.productId);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const getReviewEligibility = async (req, res) => {
  const result = await getReviewEligibilityService(getUserId(req), req.params.productId);
  return res.status(result.EC === 0 ? 200 : 400).json(result);
};

export const createReview = async (req, res) => {
  const result = await createReviewService(getUserId(req), req.params.productId, req.body);
  return res.status(result.EC === 0 ? 201 : 400).json(result);
};
