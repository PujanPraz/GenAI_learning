import express from "express";
import Groq from "groq-sdk";
import prompts from "../systemPrompts/prompts.js";

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/ask-stream", async (req, res) => {
  const { question, language, persona } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const systemPrompt = prompts[persona] || prompts.default;

  const finalQuestion = language
    ? `Answer in ${language}: ${question}`
    : question;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: finalQuestion,
        },
      ],
      stream: true,
    });

    let totalTokens = 0;

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || "";

      if (token) {
        totalTokens++;
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ token: "[DONE]", totalTokens })}\n\n`);
    res.end();
  } catch (error) {
    console.log(error);
    res.write(
      `data: ${JSON.stringify({ error: "An error occurred while processing your request." })}\n\n`,
    );
    res.end();
  }
});

export default router;
