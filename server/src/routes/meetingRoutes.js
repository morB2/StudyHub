import express from "express";
import { addMeeting, fetchMeetingsByGroup, removeMeeting } from "../controllers/meetingController.js";

const router = express.Router();

// Route to schedule a meeting
router.post("/", addMeeting);

// Route to get all meetings for a group
router.get("/", fetchMeetingsByGroup);

// Route to delete a meeting
router.delete("/:id", removeMeeting);

export default router;

