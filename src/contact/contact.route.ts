import { Router } from "express";
import { createContact } from "./contact.controller";

const router = Router();

router.post("/create-contact", createContact);

export default router;
