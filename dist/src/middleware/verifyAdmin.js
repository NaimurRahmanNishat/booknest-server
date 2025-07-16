"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdmin = void 0;
const verifyAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        res.status(403).send({ message: "Access denied! Only admin can access!" });
        return;
    }
    next();
};
exports.verifyAdmin = verifyAdmin;
