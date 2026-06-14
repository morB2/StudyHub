import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

/**
 * Creates a new notice. Enforces that only members of the group can publish notices.
 * @param {Object} noticeData
 * @param {string} noticeData.groupId
 * @param {string|number} noticeData.authorId
 * @param {string} noticeData.title
 * @param {string} noticeData.content
 * @returns {Promise<Object>} The created notice details.
 */
export const createNotice = async ({ groupId, authorId, title, content }) => {
  // 1. Verify membership
  const { data: member, error: memberError } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId)
    .eq("user_id", authorId)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }

  if (!member) {
    const error = new Error("Only group members can publish notices.");
    error.status = 403;
    throw error;
  }

  // 2. Insert notice
  const { data, error } = await supabase
    .from("notices")
    .insert([
      {
        group_id: groupId,
        author_id: authorId,
        title: title.trim(),
        content: content.trim(),
      },
    ])
    .select(`
      *,
      users (
        name
      )
    `)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    groupId: data.group_id,
    authorId: data.author_id,
    authorName: data.users ? data.users.name : "Unknown User",
    title: data.title,
    content: data.content,
    createdAt: data.created_at,
  };
};

/**
 * Fetches all notices for a specific study group, joined with the author's name.
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<Array<Object>>} List of notices.
 */
export const getNoticesByGroup = async (groupId) => {
  const { data, error } = await supabase
    .from("notices")
    .select(`
      *,
      users (
        name
      )
    `)
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).map((notice) => ({
    id: notice.id,
    groupId: notice.group_id,
    authorId: notice.author_id,
    authorName: notice.users ? notice.users.name : "Unknown User",
    title: notice.title,
    content: notice.content,
    createdAt: notice.created_at,
  }));
};

/**
 * Deletes a notice. Only the creator of the notice can delete it.
 * @param {string} noticeId - The notice ID to delete.
 * @param {string|number} authorId - The ID of the user requesting deletion.
 * @returns {Promise<Object>} The deleted notice record info.
 */
export const deleteNotice = async (noticeId, authorId) => {
  // 1. Fetch notice to verify ownership
  const { data: notice, error: fetchError } = await supabase
    .from("notices")
    .select("id, author_id")
    .eq("id", noticeId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  if (!notice) {
    const error = new Error("Notice not found");
    error.status = 404;
    throw error;
  }

  if (String(notice.author_id) !== String(authorId)) {
    const error = new Error("You can only delete notices that you created.");
    error.status = 403;
    throw error;
  }

  // 2. Perform deletion
  const { data, error: deleteError } = await supabase
    .from("notices")
    .delete()
    .eq("id", noticeId)
    .select()
    .single();

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  return {
    id: data.id,
    groupId: data.group_id,
  };
};

