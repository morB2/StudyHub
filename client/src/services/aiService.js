const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData.error || errorData.message || "AI request failed");
    err.status = response.status;
    throw err;
  }
  return response.json();
};

/**
 * Sends chatbot question and group context to the AI server.
 * @param {string} message - The student's question.
 * @param {Object} groupContext - Context data of the study group.
 * @returns {Promise<Object>} The AI response.
 */
export const chatWithAiApi = async (message, groupContext) => {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, groupContext }),
  });
  return handleResponse(response);
};
