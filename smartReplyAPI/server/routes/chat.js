import express from "express";
import Groq from "groq-sdk";
import prompts from "../systemPrompts/prompts.js";
import { memoryStore } from "../store/memoryStore.js";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/chat", async (req, res) => {
  const { message, persona, sessionId } = req.body;

  if (!message || !sessionId) {
    return res
      .status(400)
      .json({ error: "Message and sessionId are required" });
  }

  const systemPrompt = prompts[persona] || prompts.default;

  const history = memoryStore.getHistory(sessionId);

  memoryStore.addMessage(sessionId, "user", message);

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...history,
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    memoryStore.addMessage(sessionId, "assistant", reply);

    res.json({
      reply,
      sessionId,
      totalMessages: memoryStore.getHistory(sessionId).length,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to get response from Groq" });
  }
});

// fetch full chat history
router.get("/chat/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const history = memoryStore.getHistory(sessionId);

  res.json({
    sessionId,
    totalMessages: history.length,
    history,
  });
});

// clear a session
router.delete("/chat/history/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  memoryStore.clearHistory(sessionId);
  res.json({ message: `Session ${sessionId} cleared` });
});

export default router;
