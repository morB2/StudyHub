import express from "express";
import multer from "multer";
import { addUser, fetchUsers, loginUser, editUser } from "../controllers/userController.js";

const router = express.Router();

// הגדרת Multer לשמירת קבצים בזיכרון
const upload = multer({ storage: multer.memoryStorage() });

// הראוטים שלנו
router.post("/", addUser);
router.get("/", fetchUsers);
router.post("/login", loginUser);
router.put("/update", upload.single("avatar"), editUser); // הנתיב החדש לפרופיל

export default router;