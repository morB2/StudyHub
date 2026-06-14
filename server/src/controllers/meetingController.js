import { createMeetingInDb, getMeetingsByGroup, deleteMeetingFromDb } from "../services/meetingService.js";

/**
 * Endpoint to add a new meeting.
 */
export const addMeeting = async (req, res) => {
  try {
    const { groupId, title, startTime, location, creatorId } = req.body;

    if (!groupId || !title || !startTime || !creatorId) {
      return res.status(400).json({ error: "groupId, title, startTime, and creatorId are required" });
    }

    const meeting = await createMeetingInDb({
      groupId,
      title,
      startDatetime: startTime,
      locationOrLink: location,
      createdBy: creatorId
    });

    res.status(201).json(meeting);
  } catch (error) {
    console.error("Create meeting controller error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to create meeting" });
  }
};

/**
 * Endpoint to fetch meetings for a study group.
 */
export const fetchMeetingsByGroup = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res.status(400).json({ error: "groupId query parameter is required" });
    }

    const meetings = await getMeetingsByGroup(groupId);
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Fetch meetings controller error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch meetings" });
  }
};

/**
 * Endpoint to delete a meeting.
 */
export const removeMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers["x-user-id"];

    if (!id) {
      return res.status(400).json({ error: "Meeting ID is required as a route parameter" });
    }
    if (!userId) {
      return res.status(400).json({ error: "x-user-id header is required for authorization" });
    }

    const result = await deleteMeetingFromDb(id, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("Delete meeting controller error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to delete meeting" });
  }
};

