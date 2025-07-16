import { Request, Response } from "express";
import Products from "./product.model";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import Reviews from "../reviews/review.model";

interface CreateProductBody {
  name: string;
  writer: string;
  category: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  author: string;
}

interface GetAllProductsBody{ 
  category?: string;
  minPrice?: string; 
  maxPrice?: string; 
  page?: string; 
  limit?: string; 
  sort?: string;
  search?: string;
  name?: string;
}

// ✅ Create a new product controller
const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, writer, category, description, price, rating, author } = req.body;
    const image = req.body.image;

    if (!name || !writer || !category || !description || !price || !rating || !image || !author) {
      return errorResponse(res, 400, "All fields are required.", null);
    }

    const savedProduct = await Products.create({
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
    const reviews = await Reviews.find({ productId: savedProduct._id });

    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + Number(review.rating), 0);
      const averageRating = totalRating / reviews.length;
      savedProduct.rating = averageRating;
      await savedProduct.save();
    }

    return successResponse(res, 201, "Product created successfully!", savedProduct);
  } catch (error) {
    console.error("Create Product Error:", error);
    return errorResponse(res, 500, "Failed to create new product!");
  }
};

// ✅ Get all products with filters and pagination
const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, minPrice, maxPrice, page = '1', limit = '12', sort, search }: GetAllProductsBody = req.query as GetAllProductsBody;
    const filter: { category?: string; price?: { $gte: number; $lte: number }; name?: { $regex: string; $options: string }; } = {};

    // ✅ category filter
    if (category && category !== "all") {
      filter.category = category as string;
    }

    // ✅ price filter
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice as string);
      const max = parseFloat(maxPrice as string);
      if (!isNaN(min) && !isNaN(max)) {
        filter.price = { $gte: min, $lte: max };
      }
    }

    // ✅ search filter by name
    if (search && typeof search === 'string') {
      filter.name = { $regex: search, $options: 'i' }; // i = case insensitive
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // ✅ sort logic here
    const sortBy: any = {};
    if (sort === 'low') {
      sortBy.price = 1;
    } else if (sort === 'high') {
      sortBy.price = -1;
    } else {
      sortBy.createdAt = -1; // default sort
    }

    const totalProducts = await Products.countDocuments(filter);
    const totalPage = Math.ceil(totalProducts / limitNum);
    const products = await Products.find(filter)
      .sort(sortBy) // ✅ sort option
      .skip(skip)
      .limit(limitNum)
      .populate('author', 'username email');

    return successResponse(res, 200, "Products fetched successfully!", { products, totalProducts, totalPage });
  } catch (error) {
    console.error("Error fetching products:", error); 
    return errorResponse(res, 500, "Failed to get all products!");
  }
};

// ✅ get single product controller
const getSingleProduct = async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params as { id: string };
  try {
        const product = await Products.findById(id).populate('author', 'username email');
        if(!product){
          return errorResponse(res, 404, "Product not found!");
        }
        const reviews = await Reviews.find({ productId: id }).populate('userId', 'username email');
        return successResponse(res, 200, "Successfully get single product!", {product, reviews});
  } catch (error) {
    return errorResponse(res, 500, "Failed to get single product!");
  }
};

// ✅ update product controller
const updateProductById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const updatedFields: any = {
      name: req.body.name,
      writer: req.body.writer,
      category: req.body.category,
      description: req.body.description,
      price: Number(req.body.price),
      image: req.body.image,
      author: req.body.author,
    };

    const updatedProduct = await Products.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedProduct) {
      return errorResponse(res, 404, "Product not found!");
    }

    return successResponse(res, 200, "Successfully updated product!", updatedProduct);
  } catch (error) {
    console.error("Update Error:", error);
    return errorResponse(res, 500, "Failed to update product!");
  }
};


const getOneProductPerCategory = async (req: Request, res: Response) => {
  try {
    const categories = [
      "Software",
      "Machine Learning",
      "Artificial Intelligence",
      "Cyber Security",
      "Data Science",
      "Robotics",
    ];

    const productsByCategory = await Promise.all(
      categories.map(async (category) => {
        const product = await Products.findOne({ category }).sort({ createdAt: -1 });
        return product;
      })
    );

    const filtered = productsByCategory.filter(Boolean); // null বা undefined ফিল্টার
    res.status(200).json({ success: true, products: filtered });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ✅ delete product controller
const deleteProductById = async (req: Request, res: Response): Promise<void> => {
  const productId = req.params.id as string;
  try {
        const deletedProduct = await Products.findByIdAndDelete(productId);
        if(!deletedProduct){
            return errorResponse(res, 404, "Product not found!");
        }
        await Reviews.deleteMany({ productId });
        return successResponse(res, 200, "Successfully deleted product!");
  } catch (error) {
    return errorResponse(res, 500, "Failed to delete product!");
  }
}

// ✅ categories base all product 
const showAllCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const { category } = req.query;
        if (!category) {
            return errorResponse(res, 400, "Category query parameter is required!");
        }
        const products = await Products.find({ category: category }).sort({ createdAt: -1 });
        if (products.length === 0) {
            return successResponse(res, 200, "No products found for the given category!", []);
        }
        // Redirect to the category page with the products
        return successResponse(res, 200, "Successfully found products by category!", products);
        
    } catch (error) {
        return errorResponse(res, 500, "Failed to show all products!");
    }
};

// ✅ Fetch all products without pagination
const getAllProductsWithoutPagination = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Products.find({}).sort({ createdAt: -1 }).populate('author', 'username email');
    return successResponse(res, 200, "All products fetched successfully!", products);
  } catch (error) {
    console.error("Error fetching all products without pagination:", error);
    return errorResponse(res, 500, "Failed to get all products!");
  }
};  

export { createProduct , getAllProducts, getSingleProduct, updateProductById, getOneProductPerCategory, deleteProductById, showAllCategories , getAllProductsWithoutPagination};
