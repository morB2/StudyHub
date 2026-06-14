import express from "express";
import { createFolder, fetchFoldersByGroup, removeFolder } from "../controllers/folderController.js";

const router = express.Router();

router.post("/", createFolder);
router.get("/", fetchFoldersByGroup);
router.delete("/:id", removeFolder);

export default router;
