import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken";
import { getTotalReviewsCount, getUsersReview, postAReview } from "./review.controller";

const router = Router();

// ✅ create review endpoint (token verify and admin)
router.post("/post-review", verifyToken, postAReview);

// ✅ get review count
router.get("/total-reviews", getTotalReviewsCount);

// ✅ get reviews data for user
router.get("/:userId", getUsersReview);


export default router;