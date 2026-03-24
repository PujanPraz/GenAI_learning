import readline from "node:readline/promises";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function main() {
  const rl = new readline.Interface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content: `You are a smart personal assistant who answers the asked questions.
        You have access to following tools:
        1. searchWeb({query}): {query: string} //Search the latest information and real time data on the internet.
        current date and time: ${new Date().toUTCString()}`,
    },
    // {
    //   role: "user",
    //   // content: "When was iPhone 16 launched?",
    //   content: "Who is the current richest person in the world?",
    // },
  ];

  const tools = [
    {
      type: "function",
      function: {
        name: "webSearch",
        description:
          "Search the latest information and real time data on the internet.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query to perform search on.",
            },
          },
          required: ["query"],
        },
      },
    },
  ];

  while (true) {
    const question = await rl.question("You: ");

    // if user type exit or quit, then exit the loop and end the program
    if (
      question.toLowerCase() === "exit" ||
      question.toLowerCase() === "quit"
    ) {
      console.log("Exiting...");
      break;
    }

    messages.push({
      role: "user",
      content: question,
    });

    while (true) {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0,
        messages: messages,
        tools: tools,
        tool_choice: "auto",
      });

      const responseMessage = completion.choices[0].message;
      messages.push(responseMessage);

      const toolCalls = responseMessage.tool_calls;

      // ✅ No tool calls = final answer, print and exit
      if (!toolCalls || toolCalls.length === 0) {
        console.log(`AI: ${responseMessage.content}\n`);
        break;
      }

      // Otherwise handle tool calls and loop again
      for (const tool of toolCalls) {
        // console.log("Tool: ", tool);
        const functionName = tool.function.name;
        const args = tool.function.arguments;

        if (functionName === "webSearch") {
          const result = await webSearch(JSON.parse(args));
          messages.push({
            tool_call_id: tool.id,
            role: "tool",
            name: functionName,
            content: result,
          });
        }
      }
    }
  }

  rl.close();
}

main();

async function webSearch({ query }) {
  console.log("Calling web search....");

  const response = await tvly.search(query);
  // console.log("Response : ", response);

  const finalResult = response.results.map((res) => res.content).join("\n\n");

  return finalResult;
}
