"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const verifyAdmin_1 = require("../middleware/verifyAdmin");
const router = (0, express_1.Router)();
// ✅ user registration route
router.post("/register", user_controller_1.userRegistration);
// ✅ user login route
router.post("/login", user_controller_1.userLoggedIn);
// ✅ forgot password route
router.post("/forgot-password", user_controller_1.forgotPassword);
// ✅ reset password route
router.post("/reset-password", user_controller_1.resetPassword);
// ✅ update password route
router.patch("/update-password", verifyToken_1.verifyToken, user_controller_1.updatePassword);
// ✅ user logout route
router.post("/logout", user_controller_1.userLogout);
// ✅ get all users endpoints (token verify and admin)
router.get("/users", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, user_controller_1.getAllUsers);
// ✅ delete user endpoint (only admin access)
router.delete("/users/:id", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, user_controller_1.deleteUser);
// ✅ update user role (by admin only)
router.put("/users/:id", verifyToken_1.verifyToken, verifyAdmin_1.verifyAdmin, user_controller_1.updateUserRole);
// ✅ edit user profile
router.patch("/edit-profile/:id", verifyToken_1.verifyToken, user_controller_1.editUserProfile);
exports.default = router;
