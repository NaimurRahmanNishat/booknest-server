"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return (0, ResponseHandler_1.errorResponse)(res, 401, "Unauthenticated access!");
        }
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET_KEY);
        if (!decoded?.userId) {
            return (0, ResponseHandler_1.errorResponse)(res, 403, "Access denied!");
        }
        req.userId = decoded.userId;
        req.role = decoded.role;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Invalid token!");
    }
};
exports.verifyToken = verifyToken;
