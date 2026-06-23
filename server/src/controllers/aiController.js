import { chatWithAIService } from "../services/aiService.js";

/**
 * Controller to handle AI chatbot interactions.
 */
export const chatWithAI = async (req, res) => {
  try {
    const { message, groupContext } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "Message is required for AI interaction",
      });
    }

    const aiResponse = await chatWithAIService({
      message,
      groupContext,
    });

    res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error("AI chatbot error:", error);
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || "Failed to generate AI response",
    });
  }
};
