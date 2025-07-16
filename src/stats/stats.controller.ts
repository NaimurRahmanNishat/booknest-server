import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import User, { IUser } from "../users/user.model";
import Reviews from "../reviews/review.model";
import Order from "../orders/order.model";
import Products from "../products/product.model";

const userStats = async (req: Request, res: Response) => {
    const { email } = req.params as { email: string };
    try {
        if(!email){
            return errorResponse(res, 400, "Email is required!");
        }
        const user = await User.findOne({email: email}) as IUser | null;
        if(!user){
            return errorResponse(res, 404, "User not found!");
        }

        // total payments
        const totalPaymentsResult = await Order.aggregate([
            { $match: { email: email } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ])
        const totalPaymentsAmount = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;

        // total reviews
        const totalReviews = await Reviews.countDocuments({ userId: user._id });

        // total parchases products
        const purchasesProducts = await Order.distinct("products.productId", { email: email });
        const totalPurchasedProducts = purchasesProducts.length;
        return successResponse(res, 200, "User stats fetched successfully!", { totalPayments: Number(totalPaymentsAmount.toFixed(2)), totalReviews, totalPurchasedProducts });
    } catch (error) {
        return errorResponse(res, 500, "Failed to fetch user stats!");
    }
};

const adminStats = async (req: Request, res: Response) => {
    try {
        const totalOrders = await Order.countDocuments({});
        const totalProducts = await Products.countDocuments({});
        const totalReviews = await Reviews.countDocuments({});
        const totalUsers = await User.countDocuments({});
            // calculate total earnings by summing the amount of each order
    const totalEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const totalEarnings =
      totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;

    const monthlyEarningsResult = await Order.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          monthlyEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);
    const monthlyEarnings = monthlyEarningsResult.map((item) => ({
      month: item.monthlyEarnings,
      year: item._id.year,
      earnings: item.monthlyEarnings,
    }));

        return successResponse(
      res,
      200,
      "Successfully get admin stats!",
      { totalOrders, totalProducts, totalReviews, totalUsers, totalEarnings, monthlyEarnings }
    );
    } catch (error) {
        return errorResponse(res, 500, "Failed to get admin stats!");
    }
}

export { userStats , adminStats };