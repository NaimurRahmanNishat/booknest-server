import mongoose, { Schema, Document } from "mongoose";

export interface Product extends Document {
  name: string;
  writer: string;
  category: string;
  description: string;
  image: string;
  price: number;
  rating: number;
  author: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    writer: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Add text index for better search performance
productSchema.index({ name: "text" });

const Products = mongoose.model<Product>("Product", productSchema);

export default Products;
