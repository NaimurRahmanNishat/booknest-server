import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from 'body-parser';
const app: Application = express();
dotenv.config({ debug: false });
const port: number = 3100;
import formData from "express-form-data";

app.use(express.json());
app.use(formData.parse());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://booknest-client-zy9d.vercel.app'],
    credentials: true,
  })
);
app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// ✅ auth routes
import authRoutes from "./src/users/user.route";
app.use("/api/auth", authRoutes);

// ✅ product routes
import productRoutes from "./src/products/product.route";
app.use("/api/products", productRoutes);

// ✅ review routes
import reviewsRoutes from "./src/reviews/review.route";
app.use("/api/reviews", reviewsRoutes);

// ✅ order routes
import orderRoutes from "./src/orders/order.route";
app.use("/api/orders", orderRoutes);

// ✅ stats routes
import statsRoutes from "./src/stats/stats.route";
app.use("/api/stats", statsRoutes);

// ✅ contact routes
import contactRoutes from "./src/contact/contact.route";
import uploadRoute from "./src/utils/upload.route";
app.use("/api/contact", contactRoutes);

// ✅ upload image to cloudinary
app.use("/api", uploadRoute);



// ✅ database connection
async function bootstrap() {
  try {
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      console.error("❌ No MongoDB URL found in environment variables.");
      process.exit(1);
    }

    await mongoose.connect(dbUrl);
    console.log("✅ MongoDB Connected!");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed!", error);
  }
}


bootstrap();
// gKj9ArnMu3KiZSFI   naimurrahmun34
