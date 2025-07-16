"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderById = exports.updateOrderStatus = exports.getAllOrders = exports.getOrdersByOrderId = exports.getOrdersByEmail = exports.confirmPayment = exports.makePaymentRequest = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const stripe_1 = __importDefault(require("stripe"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const baseUrl_1 = __importDefault(require("../utils/baseUrl"));
const order_model_1 = __importDefault(require("./order.model"));
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
// ==============================
// ✅ makePaymentRequest controller
// ==============================
const makePaymentRequest = async (req, res) => {
    const { products } = req.body;
    try {
        const lineItems = products.map((product) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: product.name,
                    images: [product.image],
                },
                unit_amount: Math.round(product.price * 100),
            },
            quantity: product.quantity,
        }));
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${baseUrl_1.default}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl_1.default}/cancel`,
        });
        res.json({ id: session.id });
    }
    catch (error) {
        console.error("Error create checkout session ", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to create payment session");
    }
};
exports.makePaymentRequest = makePaymentRequest;
// ==============================
// ✅ confirmPayment controller
// ==============================
const confirmPayment = async (req, res) => {
    const { session_id } = req.body;
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ["line_items", "payment_intent"],
        });
        const paymentIntent = session.payment_intent;
        // Type narrowing check
        if (!paymentIntent || typeof paymentIntent === "string") {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Invalid or missing payment intent.");
        }
        const paymentIntentId = paymentIntent.id;
        let order = await order_model_1.default.findOne({ orderId: paymentIntentId });
        if (!order) {
            const lineItems = session.line_items?.data.map((item) => ({
                productId: item.price.product,
                quantity: item.quantity,
            }));
            const amount = (session.amount_total ?? 0) / 100;
            const email = session.customer_details?.email;
            order = new order_model_1.default({
                orderId: paymentIntentId,
                products: lineItems,
                amount,
                email,
                status: paymentIntent.status === "succeeded" ? "pending" : "failed",
            });
        }
        else {
            // Update status only
            order.status = paymentIntent.status === "succeeded" ? "pending" : "failed";
        }
        await order.save();
        return (0, ResponseHandler_1.successResponse)(res, 200, "Payment confirmed successfully", order);
    }
    catch (error) {
        console.error("❌ Error in confirmPayment:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to confirm payment");
    }
};
exports.confirmPayment = confirmPayment;
// ==============================
// ✅ get order by email address (check view order)
// ==============================
const getOrdersByEmail = async (req, res) => {
    const { email } = req.params;
    try {
        if (!email) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Email is required!");
        }
        const orders = await order_model_1.default.find({ email }).sort({ createdAt: -1 });
        if (orders.length === 0 || !orders) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "No orders found for the given email address!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully get all orders!", orders);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to fetch orders!");
    }
};
exports.getOrdersByEmail = getOrdersByEmail;
// ==============================
// ✅ get order by orderId (check view order)
// ==============================
const getOrdersByOrderId = async (req, res) => {
    try {
        const order = await order_model_1.default.findById(req.params.id);
        if (!order) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Order not found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully get all orders!", order);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get all orders");
    }
};
exports.getOrdersByOrderId = getOrdersByOrderId;
// ==============================
// ✅ get all orders (admin only)
// ==============================
const getAllOrders = async (req, res) => {
    try {
        const orders = await order_model_1.default.find({}).sort({ createdAt: -1 });
        if (orders.length === 0 || !orders) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "No orders found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully get all orders!", orders);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get all orders");
    }
};
exports.getAllOrders = getAllOrders;
// ==============================
// ✅ update order status (admin only)
// ==============================
const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
        return (0, ResponseHandler_1.errorResponse)(res, 400, "Missing required fields!");
    }
    try {
        const updatedOrder = await order_model_1.default.findByIdAndUpdate(id, { status, updatedAt: Date.now() }, { new: true, runValidators: true });
        if (!updatedOrder) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Order not found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully updated order status!", updatedOrder);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to update order status!");
    }
};
exports.updateOrderStatus = updateOrderStatus;
// ==============================
// ✅ delete order (admin only)
// ==============================
const deleteOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedOrder = await order_model_1.default.findByIdAndDelete(id);
        if (!deletedOrder) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Order not found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully deleted order!", deletedOrder);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to delete order!");
    }
};
exports.deleteOrderById = deleteOrderById;
