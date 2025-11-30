"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/chatbot.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
// All chatbot routes require authentication
router.use(auth_middleware_1.authenticate);
/**
 * POST /api/chatbot
 * body: { messages: { role: "user" | "assistant" | "system"; content: string }[] }
 */
router.post("/", async (req, res) => {
    try {
        const { messages } = req.body;
        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "messages must be a non-empty array.",
            });
        }
        // Create OpenAI client AFTER dotenv has run in server.ts
        const client = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const completion = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
        });
        const reply = completion.choices[0]?.message;
        return res.status(200).json({
            status: "success",
            data: { reply },
        });
    }
    catch (err) {
        console.error("Chatbot error:", err);
        return res.status(500).json({
            status: "error",
            message: "Failed to get chatbot response.",
        });
    }
});
exports.default = router;
//# sourceMappingURL=chatbot.routes.js.map