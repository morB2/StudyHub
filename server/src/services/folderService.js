import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

export const createFolder = async ({ groupId, name, parentId = null, creatorId }) => {
    const { data, error } = await supabase
        .from("folders")
        .insert([{ groupId, name, parentId, creatorId, createdAt: new Date().toISOString() }])
        .select()
        .single();

    if (error) {
        // Propagate Supabase error object for richer debugging in the controller
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
