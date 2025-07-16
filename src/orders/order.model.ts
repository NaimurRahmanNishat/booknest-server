import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId: string;
  orderId: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  email: string;
  amount: number;
  status: "pending" | "processing" | "shipped" | "completed" | "failed";
}

const orderSchema = new Schema<IOrder>(
  {
    userId: String,
    orderId: String,
    products: [
      {
        productId: { type: String, required: true },
        quantity: { type: Number, required: true },
      },
    ],
    email: String,
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
