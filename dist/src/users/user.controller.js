"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editUserProfile = exports.updateUserRole = exports.deleteUser = exports.getAllUsers = exports.userLogout = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.userLoggedIn = exports.userRegistration = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const generateToken_1 = __importDefault(require("../middleware/generateToken"));
const email_1 = __importDefault(require("../utils/email"));
// ✅ user registration controller
const userRegistration = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Username, email, and password are required");
        }
        const user = new user_model_1.default({ username, email, password });
        if (await user_model_1.default.findOne({ email })) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "User already exists!");
        }
        await user.save();
        return (0, ResponseHandler_1.successResponse)(res, 201, "User registered successfully", user);
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "User registration failed!");
    }
};
exports.userRegistration = userRegistration;
// ✅ user login controller
const userLoggedIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = (await user_model_1.default.findOne({ email }));
        if (!user) {
            res.status(404).send({ message: "User not found!" });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).send({ message: "Invalid Password!" });
            return;
        }
        const token = await (0, generateToken_1.default)(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        res.status(200).send({
            message: "Logged in successfully!",
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
                bio: user.bio,
                profession: user.profession,
            },
        });
    }
    catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).send({ message: "Login failed!" });
    }
};
exports.userLoggedIn = userLoggedIn;
// ✅ forgot password controller
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await user_model_1.default.findOne({ email });
        if (!user) {
            return (0, ResponseHandler_1.errorResponse)(res, 404, "User not found!");
        }
        const otp = user.createOTP();
        await user.save({ validateBeforeSave: false });
        const message = `Hello ${user.username}, \n\n Your OTP for password reset is ${otp}.\nThis OTP will expire in 10 minutes.\n\nRegards,\nCineflix`;
        await (0, email_1.default)({
            email: user.email,
            subject: "Password Reset OTP",
            message,
        });
        (0, ResponseHandler_1.successResponse)(res, 200, "OTP sent to your email successfully!");
    }
    catch (error) {
        (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to send OTP!");
    }
};
exports.forgotPassword = forgotPassword;
// ✅ reset password controller
const resetPassword = async (req, res) => {
    const { email, otpCode, newPassword } = req.body;
    try {
        const user = await user_model_1.default.findOne({ email, otpCode, otpExpire: { $gt: Date.now() } });
        if (!user) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, "Invalid OTP or expired!");
        }
        user.password = newPassword;
        user.otpCode = undefined;
        user.otpExpire = undefined;
        user.passwordChangedAt = new Date();
        await user.save({ validateBeforeSave: false });
        (0, ResponseHandler_1.successResponse)(res, 200, "Password reset successfully!");
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to reset password!");
    }
};
exports.resetPassword = resetPassword;
// ✅ user logout controller
const userLogout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax", // optional, depends on frontend/backend URL
            secure: process.env.NODE_ENV === "production", // secure=true in production
        });
        (0, ResponseHandler_1.successResponse)(res, 200, "Logout successful!");
    }
    catch (error) {
        console.error("Logout error:", error);
        (0, ResponseHandler_1.errorResponse)(res, 500, "Logout failed!");
    }
};
exports.userLogout = userLogout;
// ✅ updatePassword controller
const updatePassword = async (req, res) => {
    try {
        const userId = req.userId; // ⬅️ authentication middleware থেকে আসবে
        const { currentPassword, newPassword } = req.body;
        const user = await user_model_1.default.findById(userId);
        if (!user)
            return (0, ResponseHandler_1.errorResponse)(res, 404, "User not found");
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch)
            return (0, ResponseHandler_1.errorResponse)(res, 401, "Current password is incorrect");
        user.password = newPassword;
        user.passwordChangedAt = new Date();
        await user.save();
        return (0, ResponseHandler_1.successResponse)(res, 200, "Password updated successfully");
    }
    catch (error) {
        return (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to update password");
    }
};
exports.updatePassword = updatePassword;
// ✅ all users access only admin
const getAllUsers = async (req, res) => {
    try {
        const users = await user_model_1.default.find({}, "email role").sort({ createdAt: -1 });
        (0, ResponseHandler_1.successResponse)(res, 200, "All users fetched successfully!", users);
    }
    catch (error) {
        console.error("Error fetching users:", error);
        (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to fetch all users!");
    }
};
exports.getAllUsers = getAllUsers;
// ✅ user delete controller
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await user_model_1.default.findByIdAndDelete(id);
        if (!user) {
            (0, ResponseHandler_1.errorResponse)(res, 404, "User not found!");
            return;
        }
        (0, ResponseHandler_1.successResponse)(res, 200, "Successfully deleted user!");
    }
    catch (error) {
        console.error("Error deleting user:", error);
        (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to delete user!");
    }
};
exports.deleteUser = deleteUser;
// ✅ update user role
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const updatedUser = await user_model_1.default.findByIdAndUpdate(id, { role }, { new: true });
        if (!updatedUser) {
            (0, ResponseHandler_1.errorResponse)(res, 404, "User not found!");
            return;
        }
        (0, ResponseHandler_1.successResponse)(res, 200, "User role updated successfully!", updatedUser);
    }
    catch (error) {
        console.error("Error updating user role:", error);
        (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to update user role!");
    }
};
exports.updateUserRole = updateUserRole;
// ✅ update user profile
const editUserProfile = async (req, res) => {
    const { id } = req.params;
    const { username, profileImage, bio, profession } = req.body;
    try {
        const updateFields = {
            username,
            profileImage,
            bio,
            profession,
        };
        // Remove undefined fields from updateFields
        Object.keys(updateFields).forEach((key) => updateFields[key] === undefined && delete updateFields[key]);
        const updatedUser = await user_model_1.default.findByIdAndUpdate(id, updateFields, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            (0, ResponseHandler_1.errorResponse)(res, 404, "User not found!");
            return;
        }
        (0, ResponseHandler_1.successResponse)(res, 200, "User profile updated successfully!", {
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImage: updatedUser.profileImage,
            bio: updatedUser.bio,
            profession: updatedUser.profession,
        });
    }
    catch (error) {
        console.error("Failed to update user profile:", error);
        (0, ResponseHandler_1.errorResponse)(res, 500, "Failed to update user profile!");
    }
};
exports.editUserProfile = editUserProfile;
