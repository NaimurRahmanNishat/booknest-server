"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsWithoutPagination = exports.showAllCategories = exports.deleteProductById = exports.getOneProductPerCategory = exports.updateProductById = exports.getSingleProduct = exports.getAllProducts = exports.createProduct = void 0;
const product_model_1 = __importDefault(require("./product.model"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const review_model_1 = __importDefault(require("../reviews/review.model"));
// ✅ Create a new product controller
const createProduct = async (req, res) => {
    try {
        const { name, writer, category, description, price, rating, author } = req.body;
        const image = req.body.image;
        if (!name || !writer || !category || !description || !price || !rating || !image || !author) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "All fields are required.", null);
        }
        const savedProduct = await product_model_1.default.create({
            name,
            writer,
            category,
            description,
            price: Number(price),
            rating: Number(rating),
            image,
            author,
        });
        // calculate average rating for the product
        const reviews = await review_model_1.default.find({ productId: savedProduct._id });
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
            const averageRating = totalRating / reviews.length;
            savedProduct.rating = averageRating;
            await savedProduct.save();
        }
        return (0, ResponseHandler_1.successResponse)(res, 201, "Product created successfully!", savedProduct);
    }
    catch (error) {
        console.error("Create Product Error:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to create new product!");
    }
};
exports.createProduct = createProduct;
// ✅ Get all products with filters and pagination
const getAllProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, page = '1', limit = '12', sort, search } = req.query;
        const filter = {};
        // ✅ category filter
        if (category && category !== "all") {
            filter.category = category;
        }
        // ✅ price filter
        if (minPrice && maxPrice) {
            const min = parseFloat(minPrice);
            const max = parseFloat(maxPrice);
            if (!isNaN(min) && !isNaN(max)) {
                filter.price = { $gte: min, $lte: max };
            }
        }
        // ✅ search filter by name
        if (search && typeof search === 'string') {
            filter.name = { $regex: search, $options: 'i' }; // i = case insensitive
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        // ✅ sort logic here
        const sortBy = {};
        if (sort === 'low') {
            sortBy.price = 1;
        }
        else if (sort === 'high') {
            sortBy.price = -1;
        }
        else {
            sortBy.createdAt = -1; // default sort
        }
        const totalProducts = await product_model_1.default.countDocuments(filter);
        const totalPage = Math.ceil(totalProducts / limitNum);
        const products = await product_model_1.default.find(filter)
            .sort(sortBy) // ✅ sort option
            .skip(skip)
            .limit(limitNum)
            .populate('author', 'username email');
        return (0, ResponseHandler_1.successResponse)(res, 200, "Products fetched successfully!", { products, totalProducts, totalPage });
    }
    catch (error) {
        console.error("Error fetching products:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get all products!");
    }
};
exports.getAllProducts = getAllProducts;
// ✅ get single product controller
const getSingleProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await product_model_1.default.findById(id).populate('author', 'username email');
        if (!product) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Product not found!");
        }
        const reviews = await review_model_1.default.find({ productId: id }).populate('userId', 'username email');
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully get single product!", { product, reviews });
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get single product!");
    }
};
exports.getSingleProduct = getSingleProduct;
// ✅ update product controller
const updateProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedFields = {
            name: req.body.name,
            writer: req.body.writer,
            category: req.body.category,
            description: req.body.description,
            price: Number(req.body.price),
            image: req.body.image,
            author: req.body.author,
        };
        const updatedProduct = await product_model_1.default.findByIdAndUpdate(id, updatedFields, { new: true });
        if (!updatedProduct) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Product not found!");
        }
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully updated product!", updatedProduct);
    }
    catch (error) {
        console.error("Update Error:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to update product!");
    }
};
exports.updateProductById = updateProductById;
const getOneProductPerCategory = async (req, res) => {
    try {
        const categories = [
            "Software",
            "Machine Learning",
            "Artificial Intelligence",
            "Cyber Security",
            "Data Science",
            "Robotics",
        ];
        const productsByCategory = await Promise.all(categories.map(async (category) => {
            const product = await product_model_1.default.findOne({ category }).sort({ createdAt: -1 });
            return product;
        }));
        const filtered = productsByCategory.filter(Boolean); // null বা undefined ফিল্টার
        res.status(200).json({ success: true, products: filtered });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.getOneProductPerCategory = getOneProductPerCategory;
// ✅ delete product controller
const deleteProductById = async (req, res) => {
    const productId = req.params.id;
    try {
        const deletedProduct = await product_model_1.default.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "Product not found!");
        }
        await review_model_1.default.deleteMany({ productId });
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully deleted product!");
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to delete product!");
    }
};
exports.deleteProductById = deleteProductById;
// ✅ categories base all product 
const showAllCategories = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Category query parameter is required!");
        }
        const products = await product_model_1.default.find({ category: category }).sort({ createdAt: -1 });
        if (products.length === 0) {
            return (0, ResponseHandler_1.successResponse)(res, 200, "No products found for the given category!", []);
        }
        // Redirect to the category page with the products
        return (0, ResponseHandler_1.successResponse)(res, 200, "Successfully found products by category!", products);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to show all products!");
    }
};
exports.showAllCategories = showAllCategories;
// ✅ Fetch all products without pagination
const getAllProductsWithoutPagination = async (req, res) => {
    try {
        const products = await product_model_1.default.find({}).sort({ createdAt: -1 }).populate('author', 'username email');
        return (0, ResponseHandler_1.successResponse)(res, 200, "All products fetched successfully!", products);
    }
    catch (error) {
        console.error("Error fetching all products without pagination:", error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to get all products!");
    }
};
exports.getAllProductsWithoutPagination = getAllProductsWithoutPagination;
