// src/routes/chatbot.routes.ts
import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import OpenAI from "openai";

const router = Router();

// All chatbot routes require authentication
router.use(authenticate);

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
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
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
  } catch (err: any) {
    console.error("Chatbot error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to get chatbot response.",
    });
  }
});

export default router;
