import {
  createNotice as createNoticeService,
  getNoticesByGroup as getNoticesByGroupService,
  deleteNotice as deleteNoticeService,
} from "../services/noticeService.js";

/**
 * Controller to create a new notice inside a group.
 */
export const createNotice = async (req, res) => {
  try {
    const { groupId, authorId, title, content } = req.body;

    if (!groupId || !authorId || !title || !content) {
      return res.status(400).json({
        error: "groupId, authorId, title, and content are required fields",
      });
    }

    const newNotice = await createNoticeService({
      groupId,
      authorId,
      title,
      content,
    });

    res.status(201).json(newNotice);
  } catch (error) {
    console.error("Notice creation error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Failed to create notice",
    });
  }
};

/**
 * Controller to fetch all notices for a specific group.
 */
export const fetchNoticesByGroup = async (req, res) => {
  try {
    const { groupId } = req.query;

    if (!groupId) {
      return res.status(400).json({
        error: "groupId query parameter is required",
      });
    }

    const notices = await getNoticesByGroupService(groupId);
    res.status(200).json(notices);
  } catch (error) {
    console.error("Fetch notices error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Failed to fetch notices",
    });
  }
};

/**
 * Controller to delete a notice.
 */
export const removeNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const reqAuthorId = req.body.authorId || req.query.authorId;

    if (!id) {
      return res.status(400).json({
        error: "Notice id parameter is required",
      });
    }

    if (!reqAuthorId) {
      return res.status(400).json({
        error: "authorId is required to delete a notice",
      });
    }

    const result = await deleteNoticeService(id, reqAuthorId);
    res.status(200).json({
      message: "Notice deleted successfully",
      ...result,
    });
  } catch (error) {
    console.error("Delete notice error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Failed to delete notice",
    });
  }
};

