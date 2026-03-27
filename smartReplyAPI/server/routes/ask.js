import express from "express";
import Groq from "groq-sdk";
import prompts from "../systemPrompts/prompts.js";

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/ask", async (req, res) => {
  const { language, question, persona } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Question is required" });
  }

  const systemPrompt = prompts[persona] || prompts["default"];

  const finalQuestion = language
    ? `Answer in ${language}: ${question}`
    : question;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
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
    });

    const answer = completion.choices[0].message.content;

    res.json({ answer, language: language || "English (default)" });
  } catch (error) {
    console.error("error fetching answer from Groq:", error);
    res.status(500).json({ error: "Failed to fetch answer from Groq" });
  }
});

export default router;
