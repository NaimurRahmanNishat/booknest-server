import express, { Application } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import formData from "express-form-data";

const app: Application = express();
dotenv.config();

const port: number = 3100;

/* ================= CORS FIX (TOP PRIORITY) ================= */
const allowedOrigins = [
  "http://localhost:5173",
  "https://booknest-client-zy9d.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// 🔥 Handle preflight requests
app.options("*", cors());

// 🔥 Extra safety for Vercel পরিবেশ
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://booknest-client-zy9d.vercel.app"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(formData.parse());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

/* ================= ROUTES ================= */

// auth
import authRoutes from "./src/users/user.route";
app.use("/api/auth", authRoutes);

// products
import productRoutes from "./src/products/product.route";
app.use("/api/products", productRoutes);

// reviews
import reviewsRoutes from "./src/reviews/review.route";
app.use("/api/reviews", reviewsRoutes);

// orders
import orderRoutes from "./src/orders/order.route";
app.use("/api/orders", orderRoutes);

// stats
import statsRoutes from "./src/stats/stats.route";
app.use("/api/stats", statsRoutes);

// contact
import contactRoutes from "./src/contact/contact.route";
app.use("/api/contact", contactRoutes);

// upload
import uploadRoute from "./src/utils/upload.route";
app.use("/api", uploadRoute);

/* ================= DATABASE ================= */
async function bootstrap() {
  try {
    const dbUrl = process.env.DB_URL;

    if (!dbUrl) {
      console.error("❌ No MongoDB URL found.");
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


















// import express, { Application } from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import bodyParser from 'body-parser';
// const app: Application = express();
// dotenv.config({ debug: false });
// const port: number = 3100;
// import formData from "express-form-data";

// app.use(express.json());
// app.use(formData.parse());
// app.use(express.urlencoded({ extended: true }));
// app.use(
//   cors({
//     origin: ['http://localhost:5173', 'https://booknest-client-zy9d.vercel.app'],
//     credentials: true,
//   })
// );
// app.use(bodyParser.json({ limit: "20mb" }));
// app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
// app.use(cookieParser());

// // ✅ auth routes
// import authRoutes from "./src/users/user.route";
// app.use("/api/auth", authRoutes);

// // ✅ product routes
// import productRoutes from "./src/products/product.route";
// app.use("/api/products", productRoutes);

// // ✅ review routes
// import reviewsRoutes from "./src/reviews/review.route";
// app.use("/api/reviews", reviewsRoutes);

// // ✅ order routes
// import orderRoutes from "./src/orders/order.route";
// app.use("/api/orders", orderRoutes);

// // ✅ stats routes
// import statsRoutes from "./src/stats/stats.route";
// app.use("/api/stats", statsRoutes);

// // ✅ contact routes
// import contactRoutes from "./src/contact/contact.route";
// import uploadRoute from "./src/utils/upload.route";
// app.use("/api/contact", contactRoutes);

// // ✅ upload image to cloudinary
// app.use("/api", uploadRoute);



// // ✅ database connection
// async function bootstrap() {
//   try {
//     const dbUrl = process.env.DB_URL;
//     if (!dbUrl) {
//       console.error("❌ No MongoDB URL found in environment variables.");
//       process.exit(1);
//     }

//     await mongoose.connect(dbUrl);
//     console.log("✅ MongoDB Connected!");

//     app.listen(port, () => {
//       console.log(`🚀 Server running on http://localhost:${port}`);
//     });
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed!", error);
//   }
// }


// bootstrap();
// gKj9ArnMu3KiZSFI   naimurrahmun34
