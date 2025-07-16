import { Router } from "express";
import { deleteUser, editUserProfile, forgotPassword, getAllUsers, resetPassword, updatePassword, updateUserRole, userLoggedIn, userLogout, userRegistration } from "./user.controller";
import { verifyToken } from "../middleware/verifyToken";
import { verifyAdmin } from "../middleware/verifyAdmin";


const router = Router();

// ✅ user registration route
router.post("/register", userRegistration);

// ✅ user login route
router.post("/login", userLoggedIn);

// ✅ forgot password route
router.post("/forgot-password", forgotPassword);

// ✅ reset password route
router.post("/reset-password", resetPassword);

// ✅ update password route
router.patch("/update-password", verifyToken, updatePassword);

// ✅ user logout route
router.post("/logout", userLogout);

// ✅ get all users endpoints (token verify and admin)
router.get("/users", verifyToken , verifyAdmin , getAllUsers);

// ✅ delete user endpoint (only admin access)
router.delete("/users/:id", verifyToken , verifyAdmin , deleteUser);

// ✅ update user role (by admin only)
router.put("/users/:id", verifyToken , verifyAdmin , updateUserRole);

// ✅ edit user profile
router.patch("/edit-profile/:id", verifyToken , editUserProfile);

export default router;