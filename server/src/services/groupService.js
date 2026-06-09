import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

/**
 * Creates a new study group and adds the creator as the first member.
 * @param {Object} groupData
 * @param {string} groupData.name
 * @param {string} groupData.subject
 * @param {string} [groupData.description]
 * @param {boolean} [groupData.isPrivate]
 * @param {string} groupData.creatorId
 * @returns {Promise<Object>} The created group details.
 */
export const createGroup = async ({ name, subject, description, isPrivate = false, creatorId }) => {
  // 1. Insert the group details into the 'groups' table
  const { data: groupData, error: groupError } = await supabase
    .from("groups")
    .insert([
      {
        name,
        subject,
        description,
        is_private: isPrivate,
        creator_id: creatorId,
      },
    ])
    .select();

  if (groupError) {
    throw new Error(groupError.message);
  }

  if (!groupData || groupData.length === 0) {
    throw new Error("Failed to create group record");
  }

  const newGroup = groupData[0];

  // 2. Add the creator to the 'group_members' table as the initial member
  const { error: memberError } = await supabase
    .from("group_members")
    .insert([
      {
        group_id: newGroup.id,
        user_id: creatorId,
      },
    ]);

  if (memberError) {
    throw new Error(`Group created, but failed to join as creator: ${memberError.message}`);
  }

  // Return the created group with an initial members list containing only the creator
  return {
    id: newGroup.id,
    name: newGroup.name,
    subject: newGroup.subject,
    description: newGroup.description,
    creatorId: newGroup.creator_id,
    isPrivate: newGroup.is_private,
    createdAt: newGroup.created_at,
    members: [creatorId],
  };
};

/**
 * Fetches all groups with their members list.
 * @returns {Promise<Array<Object>>} List of all groups.
 */
export const getAllGroups = async () => {
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members (
        user_id
      )
    `);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((group) => ({
    id: group.id,
    name: group.name,
    subject: group.subject,
    description: group.description,
    creatorId: group.creator_id,
    isPrivate: group.is_private,
    createdAt: group.created_at,
    members: group.group_members ? group.group_members.map((m) => m.user_id) : [],
  }));
};

/**
 * Fetches a single group by its ID, including members.
 * @param {string} id - The ID of the group.
 * @returns {Promise<Object|null>} Group details or null if not found.
 */
export const getGroupById = async (id) => {
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members (
        user_id
      )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    subject: data.subject,
    description: data.description,
    creatorId: data.creator_id,
    isPrivate: data.is_private,
    createdAt: data.created_at,
    members: data.group_members ? data.group_members.map((m) => m.user_id) : [],
  };
};

/**
 * Adds a user to a group.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} The added membership record.
 */
export const joinGroup = async (groupId, userId) => {
  const { data, error } = await supabase
    .from("group_members")
    .insert([
      {
        group_id: groupId,
        user_id: userId,
      },
    ])
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Removes a user from a group.
 * @param {string} groupId
 * @param {string} userId
 * @returns {Promise<Object>} The deleted membership record details.
 */
export const leaveGroup = async (groupId, userId) => {
  const { data, error } = await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", userId)
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

/**
 * Fetches all groups that a user is a member of.
 * @param {string} userId
 * @returns {Promise<Array<Object>>} List of groups the user belongs to.
 */
export const getUserGroups = async (userId) => {
  // First, find the group IDs that the user is a member of
  const { data: membershipData, error: membershipError } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const groupIds = membershipData.map((m) => m.group_id);
  if (groupIds.length === 0) {
    return [];
  }

  // Fetch the full details of all these groups including other members
  const { data, error } = await supabase
    .from("groups")
    .select(`
      *,
      group_members (
        user_id
      )
    `)
    .in("id", groupIds);

  if (error) {
    throw new Error(error.message);
  }

  return data.map((group) => ({
    id: group.id,
    name: group.name,
    subject: group.subject,
    description: group.description,
    creatorId: group.creator_id,
    isPrivate: group.is_private,
    createdAt: group.created_at,
    members: group.group_members ? group.group_members.map((m) => m.user_id) : [],
  }));
};
