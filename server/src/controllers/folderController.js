import {
    createFolder as createFolderService,
    getFoldersByGroup,
} from "../services/folderService.js";

export const createFolder = async (req, res) => {
    try {
        const { groupId, name, parentId = null, creatorId } = req.body;

        if (!groupId || !name || !creatorId) {
            return res.status(400).json({
                error: "groupId, name, and creatorId are required",
            });
        }

        const newFolder = await createFolderService({
            groupId,
            name,
            parentId,
            creatorId,
        });

        res.status(201).json(newFolder);
    } catch (error) {
        console.error('Folder create error:', error);
        const status = error.status || 500;
        const payload = { error: error.message || 'Internal Server Error' };
        if (error.code) payload.code = error.code;
        if (error.details) payload.details = error.details;
        res.status(status).json(payload);
    }
};

export const fetchFoldersByGroup = async (req, res) => {
    try {
        const { groupId } = req.query;

        if (!groupId) {
            return res.status(400).json({
                error: "groupId query parameter is required",
            });
        }

        const folders = await getFoldersByGroup(groupId);
        res.status(200).json(folders);
    } catch (error) {
        console.error('Fetch folders error:', error);
        const status = error.status || 500;
        const payload = { error: error.message || 'Internal Server Error' };
        if (error.code) payload.code = error.code;
        if (error.details) payload.details = error.details;
        res.status(status).json(payload);
    }
};
