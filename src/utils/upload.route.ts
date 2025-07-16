import express from "express";
import { uploadToCloudinary } from "./UploadImage";

const router = express.Router();

router.post("/upload", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ message: "Image is required" });

    const imageUrl = await uploadToCloudinary(image);
    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
});

export default router;
