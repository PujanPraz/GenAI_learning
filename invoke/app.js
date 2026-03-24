import Groq from "groq-sdk";

const groq = new Groq();

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 1,
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are a data analysis API that performs sentiment analysis on text.
                Respond only with JSON using this format:
                {
                    "sentiment_analysis": {
                    "sentiment": "positive|negative|neutral",
                    "confidence_score": 0.95,
                    "key_phrases": [
                        {
                        "phrase": "detected key phrase",
                        "sentiment": "positive|negative|neutral"
                        }
                    ],
                    "summary": "One sentence summary of the overall sentiment"
                    }
                }`,
      },
      {
        role: "user",
        content:
          "Analyze the sentiment of this customer review: 'I absolutely love this product! The quality exceeded my expectations, though shipping took longer than expected.'",
      },
    ],
    response_format: { type: "json_object" },
  });

  console.log(completion.choices[0].message.content);
}

main();
