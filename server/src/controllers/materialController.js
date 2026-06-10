import { uploadMaterialToSupabase } from "../services/materialService.js";

export const uploadMaterial = async (req, res) => {
  try {
    const file = req.file;
    const { group_id, folder_id, uploader_id, file_name } = req.body;

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!group_id || !uploader_id || !file_name) {
      return res.status(400).json({ error: "group_id, uploader_id and file_name are required" });
    }

    const material = await uploadMaterialToSupabase({
      file,
      groupId: group_id,
      folderId: folder_id || null,
      uploaderId: uploader_id,
      fileName: file_name,
    });

    res.status(201).json({ message: "Material uploaded", material });
  } catch (error) {
    console.error("Material upload error:", error);
    res.status(error.status || 500).json({ error: error.message || "Upload failed" });
  }
};
