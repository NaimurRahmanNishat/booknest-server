"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersReview = exports.getTotalReviewsCount = exports.postAReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const review_model_1 = __importDefault(require("./review.model"));
const product_model_1 = __importDefault(require("../products/product.model"));
// ✅ Post or Update a Review
const postAReview = async (req, res) => {
    try {
        const { comment, rating, productId } = req.body;
        const userId = req.userId;
        if (!comment || rating === undefined || !userId || !productId) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Missing required fields!");
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const productObjectId = new mongoose_1.default.Types.ObjectId(productId);
        const existingReview = await review_model_1.default.findOne({ userId: userObjectId, productId: productObjectId });
        if (existingReview) {
            existingReview.comment = comment;
            existingReview.rating = rating;
            await existingReview.save();
        }
        else {
            await review_model_1.default.create({ comment, rating, userId: userObjectId, productId: productObjectId });
        }
        const reviews = await review_model_1.default.find({ productId: productObjectId });
        const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        const product = await product_model_1.default.findById(productObjectId);
        if (product) {
            product.rating = averageRating;
            await product.save({ validateBeforeSave: false });
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully posted a review!", { reviews });
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to post a review!");
    }
};
exports.postAReview = postAReview;
// ✅ Get reviews by user ID
const getUsersReview = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "User ID is required!");
        }
        const reviews = await review_model_1.default.find({ userId });
        if (reviews.length === 0) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "No reviews found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "User reviews retrieved successfully!", reviews);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get user reviews!");
    }
};
exports.getUsersReview = getUsersReview;
// ✅ Get total reviews count
const getTotalReviewsCount = async (_req, res) => {
    try {
        const totalReviews = await review_model_1.default.countDocuments({});
        return (0, ResponseHandler_1.successResponse)(res, 200, "Total reviews count fetched successfully!", { totalReviews });
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get total reviews count!");
    }
};
exports.getTotalReviewsCount = getTotalReviewsCount;
