import { useState } from "react";

export default function StreamChat() {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    setAnswer(""); // clear previous answer
    setLoading(true);

    // 👇 fetch with streaming — NOT axios (axios doesn't support SSE well)
    const response = await fetch("http://localhost:5000/api/ask-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: "Explain MongoDB indexes in simple terms",
      }),
    });

    // 👇 This is the streaming reader — like reading a file line by line
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the chunk and parse each SSE line
      const chunk = decoder.decode(value);
      const lines = chunk
        .split("\n")
        .filter((line) => line.startsWith("data: "));

      for (const line of lines) {
        const json = JSON.parse(line.replace("data: ", ""));

        if (json.token === "[DONE]") {
          setLoading(false);
          break;
        }

        // 👇 Append each token to state — this is what creates the typing effect
        // Think of it like setState being called 50 times rapidly
        setAnswer((prev) => prev + json.token);
      }
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "monospace" }}>
      <button onClick={askQuestion} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>
      <p style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>{answer}</p>
    </div>
  );
}
