import express from "express";
import { chatWithAI } from "../controllers/aiController.js";

const router = express.Router();

// Route to interact with the AI chatbot
router.post("/chat", chatWithAI);

export default router;
