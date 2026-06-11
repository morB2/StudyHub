import connectSupabase from "../config/supabasedb.js";

const supabase = connectSupabase();

const sanitizeFileName = (fileName) => {
    return fileName
        .normalize("NFC")
        .replace(/[^a-zA-Z0-9._-]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .slice(0, 255);
};

export const uploadMaterialToSupabase = async ({
    file,
    groupId,
    folderId,
    uploaderId,
    fileName,
    bucket = "materials",
}) => {
    const safeFileName = sanitizeFileName(file.originalname || fileName || "upload");
    const storagePath = `${groupId}/${Date.now()}_${safeFileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (uploadError) {
        throw uploadError;
    }

    const { data: urlData, error: urlError } = await supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

    if (urlError) {
        throw urlError;
    }

    const { data: material, error: insertError } = await supabase
        .from("materials")
        .insert([
            {
                groupId,
                folderId,
                uploaderId,
                fileName,
                storagePath,
                fileUrl: urlData.publicUrl,
                createdAt: new Date().toISOString(),
            },
        ])
        .select()
        .single();

    if (insertError) {
        throw insertError;
    }

    return material;
};

export const getMaterialsByGroup = async (groupId) => {
    const { data, error } = await supabase
        .from("materials")
        .select(`*
            `)
        .eq("groupId", groupId)
        .order("createdAt", { ascending: false });

    if (error) {
        throw error;
    }

    return data || [];
};

export const deleteMaterialFromSupabase = async (id) => {
    const { data: material, error: fetchError } = await supabase
        .from("materials")
        .select("id, storagePath")
        .eq("id", id)
        .maybeSingle();

    if (fetchError) {
        throw fetchError;
    }

    if (!material) {
        const err = new Error("Material not found");
        err.status = 404;
        throw err;
    }

    if (material.storagePath) {
        const { error: removeError } = await supabase.storage
            .from("materials")
            .remove([material.storagePath]);

        if (removeError) {
            throw removeError;
        }
    }

    const { error: deleteError } = await supabase
        .from("materials")
        .delete()
        .eq("id", id);

    if (deleteError) {
        throw deleteError;
    }

    return material;
};
