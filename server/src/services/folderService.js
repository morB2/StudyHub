import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

export const createFolder = async ({ groupId, name, parentId = null, creatorId }) => {
    const trimmedName = name?.trim();
    if (!groupId || !trimmedName || !creatorId) {
        const err = new Error("groupId, name, and creatorId are required");
        err.status = 400;
        throw err;
    }

    // Validate duplicate folder name within the same group and parent folder
    let duplicateQuery = supabase
        .from("folders")
        .select("id", { head: true, count: "exact" })
        .eq("groupId", groupId)
        .eq("name", trimmedName);

    duplicateQuery = parentId === null
        ? duplicateQuery.is("parentId", null)
        : duplicateQuery.eq("parentId", parentId);

    const { count, error: duplicateError } = await duplicateQuery;
    if (duplicateError) {
        throw duplicateError;
    }

    if (count > 0) {
        const err = new Error("Folder name already exists in this location.");
        err.status = 409;
        throw err;
    }

    const { data, error } = await supabase
        .from("folders")
        .insert([{ groupId, name: trimmedName, parentId, creatorId, createdAt: new Date().toISOString() }])
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const getFoldersByGroup = async (groupId) => {
    const { data, error } = await supabase
        .from("folders")
        .select("*")
        .eq("groupId", groupId)
        .order("createdAt", { ascending: true });

    if (error) {
        throw error;
    }

    return data;
};
