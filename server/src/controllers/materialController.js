import {
  uploadMaterialToSupabase,
  getMaterialsByGroup,
  searchMaterialsByGroup,
  deleteMaterialFromSupabase,
  updateMaterialFolderInSupabase,
} from "../services/materialService.js";

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

export const fetchMaterialsByGroup = async (req, res) => {
  try {
    const { groupId } = req.query;
    if (!groupId) {
      return res.status(400).json({ error: "groupId query parameter is required" });
    }

    const materials = await getMaterialsByGroup(groupId);
    res.status(200).json(materials);
  } catch (error) {
    console.error("Fetch materials error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to fetch materials" });
  }
};

export const searchMaterialsInGroup = async (req, res) => {
  try {
    const { id: groupId } = req.params;
    const { q } = req.query;

    if (!groupId) {
      return res.status(400).json({ error: "groupId path parameter is required" });
    }

    if (!q || !q.trim()) {
      return res.status(200).json([]);
    }

    const materials = await searchMaterialsByGroup(groupId, q.trim());
    res.status(200).json(materials);
  } catch (error) {
    console.error("Search materials error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to search materials" });
  }
};

export const deleteMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Material id is required" });
    }

    const deletedMaterial = await deleteMaterialFromSupabase(id);
    res.status(200).json({ message: "Material deleted", id: deletedMaterial.id });
  } catch (error) {
    console.error("Delete material error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to delete material" });
  }
};

export const updateMaterialFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { folderId } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Material id is required" });
    }

    const updatedMaterial = await updateMaterialFolderInSupabase(id, folderId);
    res.status(200).json({ message: "Material moved successfully", material: updatedMaterial });
  } catch (error) {
    console.error("Update material folder error:", error);
    res.status(error.status || 500).json({ error: error.message || "Failed to move material" });
  }
};
