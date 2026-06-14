const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.error || errorData.message || "API request failed");
        err.status = response.status;
        throw err;
    }
    return response.json();
};

/**
 * Fetches all notices for a specific study group from the backend.
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<Array<Object>>} List of notices.
 */
export const getNoticesByGroup = async (groupId) => {
    const response = await fetch(
        `${API_BASE_URL}/notices?groupId=${encodeURIComponent(groupId)}`,
    );
    return handleResponse(response);
};

/**
 * Sends a request to the backend to create a new notice.
 * @param {Object} noticeData
 * @param {string} noticeData.groupId
 * @param {string|number} noticeData.authorId
 * @param {string} noticeData.title
 * @param {string} noticeData.content
 * @returns {Promise<Object>} The created notice details.
 */
export const createNotice = async ({ groupId, authorId, title, content }) => {
    const response = await fetch(`${API_BASE_URL}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, authorId, title, content }),
    });
    return handleResponse(response);
};

/**
 * Sends a request to the backend to delete a notice.
 * @param {string} noticeId - The notice ID to delete.
 * @param {string|number} authorId - The ID of the user requesting deletion.
 * @returns {Promise<Object>} API JSON response.
 */
export const deleteNoticeApi = async (noticeId, authorId) => {
    const response = await fetch(`${API_BASE_URL}/notices/${encodeURIComponent(noticeId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId }),
    });
    return handleResponse(response);
};

