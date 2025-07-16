import mongoose, { Schema, Document } from "mongoose";

// 1️⃣ Interface for TypeScript
export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// 2️⃣ Mongoose Schema
const contactSchema = new Schema<IContact>({
    name: { type: String, required: true, minlength: 3 },     
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true, minlength: 20 }
}, {
    timestamps: true
});

// 3️⃣ Mongoose Model
const Contact = mongoose.model<IContact>("Contact", contactSchema);
export default Contact;
