import express from "express";
import { addMeeting, fetchMeetingsByGroup } from "../controllers/meetingController.js";

const router = express.Router();

// Route to schedule a meeting
router.post("/", addMeeting);

// Route to get all meetings for a group
router.get("/", fetchMeetingsByGroup);

export default router;
