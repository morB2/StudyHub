import express from "express";
import { createFolder, fetchFoldersByGroup } from "../controllers/folderController.js";

const router = express.Router();

router.post("/", createFolder);
router.get("/", fetchFoldersByGroup);

export default router;
