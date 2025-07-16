import { Router } from "express";
import { confirmPayment, deleteOrderById, getAllOrders, getOrdersByEmail, getOrdersByOrderId, makePaymentRequest, updateOrderStatus } from "./order.controller";

const router = Router();

// ✅ create checkout session
router.post("/create-checkout-session", makePaymentRequest);

// ✅ confirm payment
router.post("/confirm-payment", confirmPayment);

// ✅ get order by email address (check view order)
router.get("/:email", getOrdersByEmail);

// ✅ get order by orderId (check view order)
router.get("/order/:id", getOrdersByOrderId);

// ✅ get all orders (admin only)
router.get("/", getAllOrders);

// ✅ update order status (admin only)
router.patch("/update-order-status/:id", updateOrderStatus);

// ✅ delete order (admin only)
router.delete("/delete-order/:id", deleteOrderById);

export default router;