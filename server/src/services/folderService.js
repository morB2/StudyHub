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

export const deleteFolder = async (folderId) => {
    // 1. Fetch the target folder to verify existence and get groupId
    const { data: targetFolder, error: fetchErr } = await supabase
        .from("folders")
        .select("*")
        .eq("id", folderId)
        .maybeSingle();

    if (fetchErr) throw fetchErr;
    if (!targetFolder) {
        const err = new Error("Folder not found");
        err.status = 404;
        throw err;
    }

    const groupId = targetFolder.groupId;

    // 2. Fetch all folders in the group
    const { data: allFolders, error: foldersErr } = await supabase
        .from("folders")
        .select("*")
        .eq("groupId", groupId);

    if (foldersErr) throw foldersErr;

    // 3. Find descendant folder IDs recursively
    const folderIdsToDelete = [folderId];
    const getDescendants = (parentId) => {
        const children = allFolders.filter(f => f.parentId === parentId);
        for (const child of children) {
            folderIdsToDelete.push(child.id);
            getDescendants(child.id);
        }
    };
    getDescendants(folderId);

    // 4. Fetch all materials (files) inside any of these folders
    const { data: materialsToDelete, error: materialsErr } = await supabase
        .from("materials")
        .select("id, storagePath")
        .in("folderId", folderIdsToDelete);

    if (materialsErr) throw materialsErr;

    // 5. Delete physical files from Supabase Storage
    const storagePaths = materialsToDelete
        .map(m => m.storagePath)
        .filter(path => !!path);

    if (storagePaths.length > 0) {
        const { error: removeError } = await supabase.storage
            .from("materials")
            .remove(storagePaths);

        if (removeError) {
            throw removeError;
        }
    }

    // 6. Delete materials from database
    if (materialsToDelete.length > 0) {
        const materialIds = materialsToDelete.map(m => m.id);
        const { error: deleteMaterialsError } = await supabase
            .from("materials")
            .delete()
            .in("id", materialIds);

        if (deleteMaterialsError) {
            throw deleteMaterialsError;
        }
    }

    // 7. Delete folders from database in reverse order (leaf first) to respect foreign key parentId references
    const reversedFolderIds = [...folderIdsToDelete].reverse();
    for (const fId of reversedFolderIds) {
        const { error: deleteFolderError } = await supabase
            .from("folders")
            .delete()
            .eq("id", fId);

        if (deleteFolderError) {
            throw deleteFolderError;
        }
    }

    return {
        deletedFolderIds: folderIdsToDelete,
        deletedMaterialIds: materialsToDelete.map(m => m.id)
    };
};

