import app from "../index";
import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const dbUrl = process.env.DB_URL;
  if (!dbUrl) throw new Error("DB_URL missing");

  await mongoose.connect(dbUrl);
  isConnected = true;
};

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    return app(req, res); // 🔥 Express কে serverless বানানো
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}