import express from "express";
import {
  createNotice,
  fetchNoticesByGroup,
  removeNotice,
  improveNoticeText,
} from "../controllers/noticeController.js";

const router = express.Router();

// Route to create a notice
router.post("/", createNotice);

// Route to fetch notices for a group
router.get("/", fetchNoticesByGroup);

// Route to delete a notice
router.delete("/:id", removeNotice);

// Route to improve a notice content using AI
router.post("/improve", improveNoticeText);

export default router;
