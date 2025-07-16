import mongoose, { Schema, Document } from "mongoose";

export interface Review extends Document {
  comment: string;
  rating: number;
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
}

const reviewSchema = new Schema<Review>(
  {
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

const Reviews = mongoose.model<Review>("Review", reviewSchema);
export default Reviews;


