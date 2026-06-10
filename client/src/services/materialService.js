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

/**
 * Uploads a file and material metadata to the backend.
 * @param {FormData} formData
 * @returns {Promise<Object>} API JSON response.
 */
export const uploadMaterialApi = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/materials`, {
    method: "POST",
    body: formData,
  });

  return handleResponse(response);
};

export const getMaterialsByGroup = async (groupId) => {
  const response = await fetch(`${API_BASE_URL}/materials?groupId=${encodeURIComponent(groupId)}`);
  return handleResponse(response);
};

export const deleteMaterialApi = async (id) => {
  const response = await fetch(`${API_BASE_URL}/materials/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return handleResponse(response);
};
