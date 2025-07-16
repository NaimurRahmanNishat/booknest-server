import User, { IUser } from "./user.model";
import { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";
import { errorResponse, successResponse } from "../utils/ResponseHandler";
import generateToken from "../middleware/generateToken";
import sendEmail from "../utils/email";
import crypto from "crypto";

// ✅ user registration controller
const userRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password }: { username: string; email: string; password: string } = req.body;
    if (!username || !email || !password) {
      return errorResponse( res, 400, "Username, email, and password are required");
    }
    const user: IUser = new User({ username, email, password });
    if (await User.findOne({ email })) {
      return errorResponse(res, 400, "User already exists!");
    }
    await user.save();
    return successResponse(res, 201, "User registered successfully", user);
  } catch (error) {
    return errorResponse(res, 500, "User registration failed!");
  }
};

// ✅ user login controller
const userLoggedIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: { email: string; password: string } = req.body;

    const user = (await User.findOne({ email })) as IUser | null;

    if (!user) {
      res.status(404).send({ message: "User not found!" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).send({ message: "Invalid Password!" });
      return;
    }

    const token = await generateToken(user._id as Types.ObjectId);

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
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).send({ message: "Login failed!" });
  }
};

// ✅ forgot password controller
const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body as { email: string };
try {
  const user = await User.findOne({ email });
  if (!user) {
    return errorResponse(res, 404, "User not found!");
  }

  const otp = user.createOTP();
  await user.save({ validateBeforeSave: false });

  const message = `Hello ${user.username}, \n\n Your OTP for password reset is ${otp}.\nThis OTP will expire in 10 minutes.\n\nRegards,\nCineflix`;
  await sendEmail({
    email: user.email,
    subject: "Password Reset OTP",
    message,
  })

  successResponse(res, 200, "OTP sent to your email successfully!");
} catch (error) {
  errorResponse(res, 500, "Failed to send OTP!");
}
};


// ✅ reset password controller
const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { email, otpCode, newPassword } = req.body as { email: string; otpCode: string; newPassword: string };
  try {
    const user = await User.findOne({ email, otpCode, otpExpire: { $gt: Date.now() } });
    if (!user) {
      return errorResponse(res, 400, "Invalid OTP or expired!");
    }
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpire = undefined;
    user.passwordChangedAt = new Date();
    await user.save({ validateBeforeSave: false });
    successResponse(res, 200, "Password reset successfully!");
  } catch (error) {
    return errorResponse(res, 500, "Failed to reset password!");
  }
};


// ✅ user logout controller
const userLogout = async (req: Request, res: Response): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax", // optional, depends on frontend/backend URL
      secure: process.env.NODE_ENV === "production", // secure=true in production
    });
    successResponse(res, 200, "Logout successful!");
  } catch (error) {
    console.error("Logout error:", error);
    errorResponse(res, 500, "Logout failed!");
  }
};


// ✅ updatePassword controller
const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.userId; // ⬅️ authentication middleware থেকে আসবে
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return errorResponse(res, 404, "User not found");

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return errorResponse(res, 401, "Current password is incorrect");

    user.password = newPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    return successResponse(res, 200, "Password updated successfully");
  } catch (error) {
    return errorResponse(res, 500, "Failed to update password");
  }
};


// ✅ all users access only admin
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, "email role").sort({ createdAt: -1 });

    successResponse(res, 200, "All users fetched successfully!", users);
  } catch (error) {
    console.error("Error fetching users:", error);
    errorResponse(res, 500, "Failed to fetch all users!");
  }
};

// ✅ user delete controller
const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      errorResponse(res, 404, "User not found!");
      return;
    }

    successResponse(res, 200, "Successfully deleted user!");
  } catch (error) {
    console.error("Error deleting user:", error);
    errorResponse(res, 500, "Failed to delete user!");
  }
};

// ✅ update user role
const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { role } = req.body as { role: string };

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    );

    if (!updatedUser) {
      errorResponse(res, 404, "User not found!");
      return;
    }

    successResponse(res, 200, "User role updated successfully!", updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    errorResponse(res, 500, "Failed to update user role!");
  }
};

// ✅ update user profile
const editUserProfile = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { username, profileImage, bio, profession } = req.body as {
    username?: string;
    profileImage?: string;
    bio?: string;
    profession?: string;
  };

  try {
    const updateFields = {
      username,
      profileImage,
      bio,
      profession,
    };

    // Remove undefined fields from updateFields
    Object.keys(updateFields).forEach(
      (key) => updateFields[key as keyof typeof updateFields] === undefined && delete updateFields[key as keyof typeof updateFields]
    );

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      errorResponse(res, 404, "User not found!");
      return;
    }

    successResponse(res, 200, "User profile updated successfully!", {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      bio: updatedUser.bio,
      profession: updatedUser.profession,
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    errorResponse(res, 500, "Failed to update user profile!");
  }
};


export { userRegistration, userLoggedIn, forgotPassword, resetPassword, updatePassword, userLogout, getAllUsers, deleteUser, updateUserRole, editUserProfile };

