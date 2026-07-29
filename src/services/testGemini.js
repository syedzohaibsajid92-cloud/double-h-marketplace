// Standalone smoke-test for the Gemini service wrapper.
// Run with: node src/services/testGemini.js

require("dotenv").config();

const { generateChatReply } = require("./geminiService");

async function main() {
    console.log("Sending test message to Gemini...\n");

    const reply = await generateChatReply("Hello, do you sell drill machines?");

    console.log("=== Gemini Reply ===");
    console.log(reply);
    console.log("===================");
}

main().catch((err) => {
    console.error("Test failed:", err.message);
    process.exit(1);
});
