import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

/**
 * Creates a new meeting record in the Supabase database.
 * @param {Object} meetingData
 * @param {string} meetingData.groupId
 * @param {string} meetingData.title
 * @param {string} meetingData.startDatetime
 * @param {string} [meetingData.locationOrLink]
 * @param {string} meetingData.createdBy
 * @returns {Promise<Object>} The inserted meeting record.
 */
export const createMeetingInDb = async ({ groupId, title, startDatetime, locationOrLink, createdBy }) => {
    const trimmedTitle = title?.trim();
    if (!groupId || !trimmedTitle || !startDatetime || !createdBy) {
        const err = new Error("groupId, title, startDatetime, and createdBy are required");
        err.status = 400;
        throw err;
    }

    const { data, error } = await supabase
        .from("meetings")
        .insert([
            {
                group_id: groupId,
                title: trimmedTitle,
                start_datetime: startDatetime,
                location_or_link: locationOrLink?.trim() || null,
                created_by: createdBy,
                created_at: new Date().toISOString()
            }
        ])
        .select()
        .single();

    if (error) {
        console.error("Database insert meeting error:", error);
        throw error;
    }

    return data;
};

/**
 * Fetches all meetings associated with a specific group ID, ordered by start time ascending.
 * @param {string} groupId
 * @returns {Promise<Array<Object>>} List of meetings.
 */
export const getMeetingsByGroup = async (groupId) => {
    if (!groupId) {
        const err = new Error("groupId is required");
        err.status = 400;
        throw err;
    }

    const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("group_id", groupId)
        .order("start_datetime", { ascending: true });

    if (error) {
        console.error("Database fetch meetings error:", error);
        throw error;
    }

    return data || [];
};
