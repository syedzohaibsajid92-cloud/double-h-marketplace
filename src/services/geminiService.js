const { GoogleGenAI } = require("@google/genai");

const SYSTEM_PROMPT =
    "You are the customer support assistant for Double H Hardware Marketplace, an " +
    "online multi-vendor marketplace for hardware tools and industrial products in " +
    "Pakistan. Be helpful, concise, and professional. Answer questions about " +
    "products, orders, and general marketplace usage. If you don't know something " +
    "specific to this store, say so honestly rather than guessing. Respond in the " +
    "same language the user writes in (English or Urdu).";

// gemini-flash-latest is a stable alias that resolves to the current GA flash
// model available on this API key. Using gemini-2.5-flash here returns a 404
// on certain key tiers even though the model is listed — see docs/ai-buildlog.md.
const MODEL = "gemini-flash-latest";

/**
 * Generate a chat reply from the Gemini API.
 *
 * @param {string} userMessage        - The latest message from the user.
 * @param {Array<{role: string, text: string}>} conversationHistory
 *   Prior turns in the conversation. Each entry must have:
 *     role — "user" or "model"
 *     text — the message content
 * @returns {Promise<string>}         - The model's reply as a plain string.
 * @throws {Error}                    - If the API key is missing or the call fails.
 */
async function generateChatReply(userMessage, conversationHistory = []) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error(
            "GEMINI_API_KEY is not set. " +
            "Add it to your .env file before calling generateChatReply()."
        );
    }

    const genAI = new GoogleGenAI({ apiKey });

    // Map prior turns into the contents array Gemini expects.
    // Each entry: { role: "user"|"model", parts: [{ text: "..." }] }
    const contents = conversationHistory.map(({ role, text }) => ({
        role,
        parts: [{ text }],
    }));

    // Append the current user message as the final turn.
    contents.push({
        role: "user",
        parts: [{ text: userMessage }],
    });

    try {
        const response = await genAI.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_PROMPT,
            },
        });

        // The raw models.generateContent() API returns response.text as a
        // plain string property, not a callable method.
        return response.text;
    } catch (err) {
        throw new Error(`Gemini API call failed: ${err.message}`);
    }
}

module.exports = { generateChatReply };
