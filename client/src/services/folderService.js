const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const err = new Error(errorData.error || errorData.message || "API request failed");
        err.status = response.status;
        throw err;
    }

    return response.json();
};

export const getFoldersByGroup = async (groupId) => {
    const response = await fetch(
        `${API_BASE_URL}/folders?groupId=${encodeURIComponent(groupId)}`,
    );
    return handleResponse(response);
};

export const createFolder = async ({ groupId, name, parentId = null, creatorId }) => {
    const response = await fetch(`${API_BASE_URL}/folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, name, parentId, creatorId }),
    });

    return handleResponse(response);
};
