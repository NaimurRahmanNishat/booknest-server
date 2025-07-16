"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const router = (0, express_1.Router)();
// ✅ create product endpoint (token verify and admin)
router.post("/create-product", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, product_controller_1.createProduct);
// ✅ get all products
router.get("/", product_controller_1.getAllProducts);
router.get("/category", product_controller_1.getOneProductPerCategory);
// ✅ get all products without pagination
router.get("/all-products", product_controller_1.getAllProductsWithoutPagination);
// ✅ get all categories
router.get("/categories", product_controller_1.showAllCategories);
// ✅ get single product
router.get("/:id", product_controller_1.getSingleProduct);
// ✅ update product endpoint (token verify and admin)
router.patch("/update-product/:id", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, product_controller_1.updateProductById);
// ✅ delete a single product (only admin access) 
router.delete("/:id", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, product_controller_1.deleteProductById);
exports.default = router;
