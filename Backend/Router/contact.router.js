import express from "express";
import { submitContactForm } from "../controllers/contact.controllers.js";

const router = express.Router();

// POST /api/contact - Submit contact form (PUBLIC)
router.post('/', submitContactForm);

export default router;
