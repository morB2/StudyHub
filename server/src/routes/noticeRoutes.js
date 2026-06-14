import express from "express";
import {
  createNotice,
  fetchNoticesByGroup,
  removeNotice,
} from "../controllers/noticeController.js";

const router = express.Router();

// Route to create a notice
router.post("/", createNotice);

// Route to fetch notices for a group
router.get("/", fetchNoticesByGroup);

// Route to delete a notice
router.delete("/:id", removeNotice);

export default router;
