const API_BASE = "http://localhost:3001/groups";

/**
 * Sends a request to the backend to create a new study group.
 * @param {Object} groupData
 * @param {string} groupData.name
 * @param {string} groupData.subject
 * @param {string} [groupData.description]
 * @param {boolean} groupData.isPrivate
 * @param {string} groupData.creatorId
 * @returns {Promise<Object>} API JSON response.
 */
export const createGroupApi = async ({ name, subject, description, isPrivate, creatorId }) => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, subject, description, isPrivate, creatorId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create group");
  }

  return response.json();
};

/**
 * Fetches all study groups from the backend server.
 * @returns {Promise<Array<Object>>} List of groups.
 */
export const fetchGroupsApi = async () => {
  const response = await fetch(API_BASE);
  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }
  return response.json();
};

/**
 * Sends a request to join a specific study group.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} API JSON response.
 */
export const joinGroupApi = async (groupId, userId) => {
  const response = await fetch(`${API_BASE}/${groupId}/join`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to join group");
  }

  return response.json();
};

/**
 * Sends a request to leave a specific study group.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} API JSON response.
 */
export const leaveGroupApi = async (groupId, userId) => {
  const response = await fetch(`${API_BASE}/${groupId}/leave`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to leave group");
  }

  return response.json();
};

/**
 * Fetches details of a specific study group from the backend.
 * @param {string} groupId
 * @returns {Promise<Object>} API JSON response containing group details and members list.
 */
export const fetchGroupByIdApi = async (groupId) => {
  const response = await fetch(`${API_BASE}/${groupId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch group details");
  }
  return response.json();
};

