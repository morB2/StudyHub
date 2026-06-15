const API_BASE = "http://localhost:3001/meetings";

/**
 * Normalizes snake_case database schema attributes into camelCase for client consistency.
 */
export const normalizeMeeting = (meet) => {
  if (!meet) return null;
  return {
    id: meet.id,
    groupId: meet.group_id,
    title: meet.title,
    startTime: meet.start_datetime,
    location: meet.location_or_link || 'Online',
    creatorId: meet.created_by,
    createdAt: meet.created_at || new Date()
  };
};

/**
 * Fetches meetings for a specific group from the server.
 */
export const getMeetingsByGroupApi = async (groupId) => {
  const response = await fetch(`${API_BASE}?groupId=${groupId}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch meetings");
  }
  return response.json();
};

/**
 * Schedules a new meeting via backend API.
 */
export const scheduleMeetingApi = async ({ groupId, title, startTime, location, creatorId }) => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ groupId, title, startTime, location, creatorId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to schedule meeting");
  }

  return response.json();
};

/**
 * Deletes a meeting by ID from the server.
 */
export const deleteMeetingApi = async (meetingId, userId) => {
  const response = await fetch(`${API_BASE}/${meetingId}`, {
    method: "DELETE",
    headers: {
      "x-user-id": userId
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || errorData.message || "Failed to delete meeting";
    const err = new Error(errorMessage);
    err.status = response.status;
    throw err;
  }

  return response.json();
};

