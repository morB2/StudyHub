import express from "express";
import multer from "multer";
import {
  uploadMaterial,
  fetchMaterialsByGroup,
  deleteMaterialById,
  updateMaterialFolder,
} from "../controllers/materialController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", fetchMaterialsByGroup);
router.delete("/:id", deleteMaterialById);
router.post("/", upload.single("file"), uploadMaterial);
router.patch("/:id", updateMaterialFolder);

export default router;
