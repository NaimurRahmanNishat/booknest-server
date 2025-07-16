"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const review_controller_1 = require("./review.controller");
const router = (0, express_1.Router)();
// ✅ create review endpoint (token verify and admin)
router.post("/post-review", verifyToken_1.verifyToken, review_controller_1.postAReview);
// ✅ get review count
router.get("/total-reviews", review_controller_1.getTotalReviewsCount);
// ✅ get reviews data for user
router.get("/:userId", review_controller_1.getUsersReview);
exports.default = router;
