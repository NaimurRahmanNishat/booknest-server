import { Request, Response } from 'express';
import Contact from './contact.model';
import { errorResponse, successResponse } from '../utils/ResponseHandler';

export const createContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name?.trim() || name.length < 3) {
      return errorResponse(res, 400, 'name must be at least 3 characters');
    }

    if (!email || !/.+@.+\..+/.test(email)) {
      return errorResponse(res, 400, 'please enter a valid email address');
    }

    if (!subject?.trim() || subject.length < 3) {
      return errorResponse(res, 400, 'subject must be at least 3 characters');
    }

    if (!message?.trim() || message.length < 20) {
      return errorResponse(res, 400, 'message must be at least 20 characters');
    }

    const contact = new Contact({ name, email, subject, message });
    await contact.save();

    return successResponse(res, 201, 'Contact saved successfully' + contact);
  } catch (error) {
    console.error('Error saving contact:', error);
    return errorResponse(res, 500, 'Failed to save contact');
  }
};
