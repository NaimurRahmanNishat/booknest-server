import { Router } from "express";
import { createProduct, deleteProductById, getAllProducts, getAllProductsWithoutPagination, getOneProductPerCategory, getSingleProduct, showAllCategories, updateProductById } from "./product.controller";
import { verifyToken } from "../middleware/verifyToken";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = Router();

// ✅ create product endpoint (token verify and admin)
router.post("/create-product", verifyToken , verifyAdmin , createProduct);

// ✅ get all products
router.get("/", getAllProducts);

router.get("/category", getOneProductPerCategory);

// ✅ get all products without pagination
router.get("/all-products", getAllProductsWithoutPagination);

// ✅ get all categories
router.get("/categories", showAllCategories);

// ✅ get single product
router.get("/:id", getSingleProduct);

// ✅ update product endpoint (token verify and admin)
router.patch("/update-product/:id", verifyToken , verifyAdmin , updateProductById);

// ✅ delete a single product (only admin access) 
router.delete("/:id", verifyToken , verifyAdmin, deleteProductById);

export default router;
