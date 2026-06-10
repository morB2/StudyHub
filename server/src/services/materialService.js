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
