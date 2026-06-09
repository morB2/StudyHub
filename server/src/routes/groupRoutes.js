import express from "express";
import {
  addGroup,
  fetchGroups,
  fetchGroupById,
  joinGroupAction,
  leaveGroupAction,
  fetchUserGroups,
} from "../controllers/groupController.js";

const router = express.Router();

// Route to create a group
router.post("/", addGroup);

// Route to fetch all groups
router.get("/", fetchGroups);

// Route to fetch groups for a specific user
router.get("/user/:userId", fetchUserGroups);

// Route to fetch a specific group by ID
router.get("/:id", fetchGroupById);

// Route to join a group
router.post("/:id/join", joinGroupAction);

// Route to leave a group
router.post("/:id/leave", leaveGroupAction);

export default router;
