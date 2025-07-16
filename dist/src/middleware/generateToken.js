"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../users/user.model"));
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET_KEY) {
    throw new Error("JWT_SECRET_KEY is not defined in environment variables.");
}
const generateToken = async (userId) => {
    try {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: "1h" });
        return token;
    }
    catch (error) {
        console.error("Error generating token", error);
        throw error;
    }
};
exports.default = generateToken;
