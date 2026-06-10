import express from "express";
import {
  addGroup,
  fetchGroups,
  fetchGroupById,
  joinGroupAction,
  leaveGroupAction,
  fetchUserGroups,
  followGroupAction,
  unfollowGroupAction,
  fetchFollowedGroups,
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

// Route to follow a group
router.post("/:id/follow", followGroupAction);

// Route to unfollow a group
router.post("/:id/unfollow", unfollowGroupAction);

// Route to get followed groups
router.get("/followed/:userId", fetchFollowedGroups);

export default router;
