import express from "express";
import { getAgoraToken } from "../controllers/agoraController.js";

const router = express.Router();

router.get("/token", getAgoraToken);

export default router;