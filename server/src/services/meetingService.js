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

/**
 * Deletes a meeting from the database after checking if the user is authorized.
 * A user is authorized if they are the creator of the meeting or the admin of the group (group creator).
 * @param {string} meetingId
 * @param {string} userId
 */
export const deleteMeetingFromDb = async (meetingId, userId) => {
    if (!meetingId || !userId) {
        const err = new Error("meetingId and userId are required");
        err.status = 400;
        throw err;
    }

    // 1. Fetch meeting to get creator and group ID
    const { data: meeting, error: meetingError } = await supabase
        .from("meetings")
        .select("created_by, group_id")
        .eq("id", meetingId)
        .maybeSingle();

    if (meetingError) {
        console.error("Database fetch meeting error:", meetingError);
        throw meetingError;
    }

    if (!meeting) {
        const err = new Error("Meeting not found");
        err.status = 404;
        throw err;
    }

    // 2. Check if user is the meeting creator
    const isMeetingCreator = String(meeting.created_by) === String(userId);
    let isGroupAdmin = false;

    if (!isMeetingCreator) {
        // Fetch group details to get group creator ID (admin check)
        const { data: group, error: groupError } = await supabase
            .from("groups")
            .select("creator_id")
            .eq("id", meeting.group_id)
            .maybeSingle();

        if (groupError) {
            console.error("Database fetch group error:", groupError);
            throw groupError;
        }

        if (group && String(group.creator_id) === String(userId)) {
            isGroupAdmin = true;
        }
    }

    // 3. Authorization check
    if (!isMeetingCreator && !isGroupAdmin) {
        const err = new Error("Forbidden: You do not have permission to delete this meeting");
        err.status = 403;
        throw err;
    }

    // 4. Perform Deletion
    const { error: deleteError } = await supabase
        .from("meetings")
        .delete()
        .eq("id", meetingId);

    if (deleteError) {
        console.error("Database delete meeting error:", deleteError);
        throw deleteError;
    }

    return { success: true };
};

