"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const router = (0, express_1.Router)();
// ✅ create checkout session
router.post("/create-checkout-session", order_controller_1.makePaymentRequest);
// ✅ confirm payment
router.post("/confirm-payment", order_controller_1.confirmPayment);
// ✅ get order by email address (check view order)
router.get("/:email", order_controller_1.getOrdersByEmail);
// ✅ get order by orderId (check view order)
router.get("/order/:id", order_controller_1.getOrdersByOrderId);
// ✅ get all orders (admin only)
router.get("/", order_controller_1.getAllOrders);
// ✅ update order status (admin only)
router.patch("/update-order-status/:id", order_controller_1.updateOrderStatus);
// ✅ delete order (admin only)
router.delete("/delete-order/:id", order_controller_1.deleteOrderById);
exports.default = router;
