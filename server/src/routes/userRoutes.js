import express from "express";

import { addUser, fetchUsers, loginUser, editUser } from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);

router.get("/", fetchUsers);
router.post("/login", loginUser);
router.put("/update", upload.single("avatar"), editUser); // הנתיב החדש לפרופיל

export default router;
