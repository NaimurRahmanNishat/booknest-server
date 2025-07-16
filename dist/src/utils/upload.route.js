"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UploadImage_1 = require("./UploadImage");
const router = express_1.default.Router();
router.post("/upload", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image)
            return res.status(400).json({ message: "Image is required" });
        const imageUrl = await (0, UploadImage_1.uploadToCloudinary)(image);
        return res.status(200).json({ url: imageUrl });
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
exports.default = router;
