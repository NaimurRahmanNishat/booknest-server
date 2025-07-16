import { Request, Response } from "express";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import Reviews from "./review.model";
import Products from "../products/product.model";

// ✅ Post or Update a Review
const postAReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comment, rating, productId }: { comment: string; rating: number; productId: string } = req.body;
    const userId = req.userId;

    if (!comment || rating === undefined || !userId || !productId) {
      return errorResponse(res, 400, "Missing required fields!");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const existingReview = await Reviews.findOne({ userId: userObjectId, productId: productObjectId });

    if (existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;
      await existingReview.save();
    } else {
      await Reviews.create({ comment, rating, userId: userObjectId, productId: productObjectId });
    }

    const reviews = await Reviews.find({ productId: productObjectId });
    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    const product = await Products.findById(productObjectId);
    if (product) {
      product.rating = averageRating;
      await product.save({ validateBeforeSave: false });
    }

    return successResponse(res, 200, "Successfully posted a review!", { reviews });
  } catch (error) {
    return errorResponse(res, 500, "Failed to post a review!");
  }
};

// ✅ Get reviews by user ID
const getUsersReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return errorResponse(res, 400, "User ID is required!");
    }

    const reviews = await Reviews.find({ userId });
    if (reviews.length===0) {
      return errorResponse(res, 404, "No reviews found!");
    }

    return successResponse(res, 200, "User reviews retrieved successfully!", reviews);
  } catch (error) {
    return errorResponse(res, 500, "Failed to get user reviews!");
  }
};

// ✅ Get total reviews count
const getTotalReviewsCount = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalReviews = await Reviews.countDocuments({});
    return successResponse(res, 200, "Total reviews count fetched successfully!", { totalReviews });
  } catch (error) {
    return errorResponse(res, 500, "Failed to get total reviews count!");
  }
};

export { postAReview, getTotalReviewsCount, getUsersReview };
