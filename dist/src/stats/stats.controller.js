"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminStats = exports.userStats = void 0;
const ResponseHandler_1 = require("../utils/ResponseHandler");
const user_model_1 = __importDefault(require("../users/user.model"));
const review_model_1 = __importDefault(require("../reviews/review.model"));
const order_model_1 = __importDefault(require("../orders/order.model"));
const product_model_1 = __importDefault(require("../products/product.model"));
const userStats = async (req, res) => {
    const { email } = req.params;
    try {
        if (!email) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Email is required!");
        }
        const user = await user_model_1.default.findOne({ email: email });
        if (!user) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "User not found!");
        }
        // total payments
        const totalPaymentsResult = await order_model_1.default.aggregate([
            { $match: { email: email } },
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);
        const totalPaymentsAmount = totalPaymentsResult.length > 0 ? totalPaymentsResult[0].totalAmount : 0;
        // total reviews
        const totalReviews = await review_model_1.default.countDocuments({ userId: user._id });
        // total parchases products
        const purchasesProducts = await order_model_1.default.distinct("products.productId", { email: email });
        const totalPurchasedProducts = purchasesProducts.length;
        return (0, ResponseHandler_1.successResponse)(res, 200, "User stats fetched successfully!", { totalPayments: Number(totalPaymentsAmount.toFixed(2)), totalReviews, totalPurchasedProducts });
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to fetch user stats!");
    }
};
exports.userStats = userStats;
const adminStats = async (req, res) => {
    try {
        const totalOrders = await order_model_1.default.countDocuments({});
        const totalProducts = await product_model_1.default.countDocuments({});
        const totalReviews = await review_model_1.default.countDocuments({});
        const totalUsers = await user_model_1.default.countDocuments({});
        // calculate total earnings by summing the amount of each order
        const totalEarningsResult = await order_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                },
            },
        ]);
        const totalEarnings = totalEarningsResult.length > 0 ? totalEarningsResult[0].totalAmount : 0;
        const monthlyEarningsResult = await order_model_1.default.aggregate([
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
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully get admin stats!", { totalOrders, totalProducts, totalReviews, totalUsers, totalEarnings, monthlyEarnings });
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get admin stats!");
    }
};
exports.adminStats = adminStats;
