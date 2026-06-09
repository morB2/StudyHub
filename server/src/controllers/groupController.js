import {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getUserGroups,
} from "../services/groupService.js";

/**
 * Controller to create a new study group.
 */
export const addGroup = async (req, res) => {
  try {
    const { name, subject, description, isPrivate, creatorId } = req.body;

    if (!name || !subject || !creatorId) {
      return res.status(400).json({
        error: "Name, subject, and creatorId are required fields",
      });
    }

    const newGroup = await createGroup({
      name,
      subject,
      description,
      isPrivate: !!isPrivate,
      creatorId,
    });

    res.status(201).json({
      message: "Group created successfully",
      data: newGroup,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Controller to fetch all study groups.
 */
export const fetchGroups = async (req, res) => {
  try {
    const groups = await getAllGroups();
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Controller to fetch a specific study group by ID.
 */
export const fetchGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await getGroupById(id);

    if (!group) {
      return res.status(404).json({
        error: "Group not found",
      });
    }

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Controller to make a user join a study group.
 */
export const joinGroupAction = async (req, res) => {
  try {
    const { id } = req.params; // group ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required to join a group",
      });
    }

    await joinGroup(id, userId);

    res.status(200).json({
      message: "Joined group successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Controller to make a user leave a study group.
 */
export const leaveGroupAction = async (req, res) => {
  try {
    const { id } = req.params; // group ID
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: "userId is required to leave a group",
      });
    }

    await leaveGroup(id, userId);

    res.status(200).json({
      message: "Left group successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * Controller to fetch all groups a specific user is member of.
 */
export const fetchUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;
    const groups = await getUserGroups(userId);
    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
