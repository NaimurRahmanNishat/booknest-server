"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContact = void 0;
const contact_model_1 = __importDefault(require("./contact.model"));
const ResponseHandler_1 = require("../utils/ResponseHandler");
const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name?.trim() || name.length < 3) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, 'name must be at least 3 characters');
        }
        if (!email || !/.+@.+\..+/.test(email)) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, 'please enter a valid email address');
        }
        if (!subject?.trim() || subject.length < 3) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, 'subject must be at least 3 characters');
        }
        if (!message?.trim() || message.length < 20) {
            return (0, ResponseHandler_1.errorResponse)(res, 400, 'message must be at least 20 characters');
        }
        const contact = new contact_model_1.default({ name, email, subject, message });
        await contact.save();
        return (0, ResponseHandler_1.successResponse)(res, 201, 'Contact saved successfully' + contact);
    }
    catch (error) {
        console.error('Error saving contact:', error);
        return (0, ResponseHandler_1.errorResponse)(res, 500, 'Failed to save contact');
    }
};
exports.createContact = createContact;
