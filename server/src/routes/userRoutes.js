import express from "express";

import { addUser, fetchUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", addUser);

router.get("/", fetchUsers);

export default router;
