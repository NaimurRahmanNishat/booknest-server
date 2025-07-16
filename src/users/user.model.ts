import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

// ✅ Interface for the User document
export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  otpCode?: string;
  otpExpire?: Date;
  passwordChangedAt?: Date;
  profileImage?: string;
  bio?: string;
  profession?: string;
  role: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createOTP(): string;
}


// ✅ Define the schema
const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  otpCode: String,
  otpExpire: Date,
  passwordChangedAt: Date,
  profileImage: String,
  bio: { type: String, maxLength: 200 },
  profession: String,
  role: {
    type: String,
    default: "user",
  },
},
{ timestamps: true }
);


// ✅ Hash password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


// ✅ Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};


// ✅ OTP generator method (6-digit OTP, valid for 10 minutes)
userSchema.methods.createOTP = function (): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otpCode = otp;
  this.otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins later
  return otp;
};


// ✅ Create model
const User = mongoose.model<IUser>("User", userSchema);
export default User;
