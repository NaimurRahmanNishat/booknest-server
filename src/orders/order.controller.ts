import { Request, Response } from "express";
import dotenv from "dotenv";
import Stripe from "stripe";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import BASE_URL from "../utils/baseUrl";
import Order from "./order.model";
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// ==============================
// ✅ product type
// ==============================
type Product = {
  _id: string;
  name: string;
  writer: string;
  category: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  author: {
    _id: string;
    username: string;
    email: string;
  };
}

// ==============================
// ✅ makePaymentRequest controller
// ==============================
const makePaymentRequest = async (req: Request, res: Response) => {
  const { products }: { products: Product[] } = req.body;
  try {
    const lineItems = products.map((product: any) => ({
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
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error create checkout session ", error);
    return errorResponse(res, 500, "Failed to create payment session");
  }
};

// ==============================
// ✅ confirmPayment controller
// ==============================
const confirmPayment = async (req: Request, res: Response) => {
  const { session_id } = req.body;
  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items", "payment_intent"],
    });

    const paymentIntent = session.payment_intent;

    // Type narrowing check
    if (!paymentIntent || typeof paymentIntent === "string") {
      return errorResponse(res, 400, "Invalid or missing payment intent.");
    }

    const paymentIntentId = paymentIntent.id;

    let order = await Order.findOne({ orderId: paymentIntentId });

    if (!order) {
      const lineItems = session.line_items?.data.map((item: any) => ({
        productId: item.price.product as string,
        quantity: item.quantity,
      }));

      const amount = (session.amount_total ?? 0) / 100;
      const email = session.customer_details?.email;

      order = new Order({
        orderId: paymentIntentId,
        products: lineItems,
        amount,
        email,
        status: paymentIntent.status === "succeeded" ? "pending" : "failed",
      });
    } else {
      // Update status only
      order.status = paymentIntent.status === "succeeded" ? "pending" : "failed";
    }

    await order.save();

    return successResponse(res, 200, "Payment confirmed successfully", order);
  } catch (error) {
    console.error("❌ Error in confirmPayment:", error);
    return errorResponse(res, 500, "Failed to confirm payment");
  }
};

// ==============================
// ✅ get order by email address (check view order)
// ==============================
const getOrdersByEmail = async (req: Request, res: Response) => {
  const { email } = req.params as { email: string };
  try {
    if(!email){
      return errorResponse(res, 400, "Email is required!");
    }
    const orders = await Order.find({email}).sort({createdAt: -1});
    if(orders.length === 0 || !orders) {
      return errorResponse(res, 404, "No orders found for the given email address!");
    }
    return successResponse(res, 200, "Successfully get all orders!", orders);
  } catch (error) {
    return errorResponse(res, 500, "Failed to fetch orders!");
  }
};

// ==============================
// ✅ get order by orderId (check view order)
// ==============================
const getOrdersByOrderId = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if(!order) {
      return errorResponse(res, 404, "Order not found!");
    }
    return successResponse(res, 200, "Successfully get all orders!", order);
  } catch (error) {
    return errorResponse(res, 500, "Failed to get all orders");
  }
}

// ==============================
// ✅ get all orders (admin only)
// ==============================
const getAllOrders = async (req: Request, res: Response) => {
    try {
    const orders = await Order.find({}).sort({createdAt: -1});
    if(orders.length === 0 || !orders) {
      return errorResponse(res, 404, "No orders found!");
    }
    return successResponse(res, 200, "Successfully get all orders!", orders);
  } catch (error) {
    return errorResponse(res, 500, "Failed to get all orders");
  }
}

// ==============================
// ✅ update order status (admin only)
// ==============================
const  updateOrderStatus = async (req: Request, res: Response) => {
  const {id} = req.params as { id: string };
  const {status} = req.body as { status: string };
  if(!status) {
    return errorResponse(res, 400, "Missing required fields!");
  }
  try {
    const updatedOrder = await Order.findByIdAndUpdate(id, { status, updatedAt: Date.now()}, { new: true, runValidators: true });
    if (!updatedOrder) {
      return errorResponse(res, 404, "Order not found!");
    }
    return successResponse(res, 200, "Successfully updated order status!", updatedOrder);
  } catch (error) {
    return errorResponse(res, 500, "Failed to update order status!");
  }
}

// ==============================
// ✅ delete order (admin only)
// ==============================
const deleteOrderById = async (req: Request, res: Response) => {
    const {id} = req.params as { id: string };
  try {
    const deletedOrder = await Order.findByIdAndDelete(id);
    if(!deletedOrder) {
      return errorResponse(res, 404, "Order not found!");
    }
    return successResponse(res, 200, "Successfully deleted order!", deletedOrder);
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete order!");
  }
}


export { makePaymentRequest, confirmPayment, getOrdersByEmail, getOrdersByOrderId, getAllOrders, updateOrderStatus, deleteOrderById };

