import { streamText } from "ai"
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from "dotenv";

dotenv.config();

// Initialize clients
const groqClient = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODELS = {
  groq: {
    default: "deepseek-r1-distill-llama-70b",
    available: [
      "deepseek-r1-distill-llama-70b",
      "llama2-70b-4096",
      "mixtral-8x7b-32768"
    ]
  },
  openai: {
    default: "gpt-3.5-turbo",
    available: [
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-4-turbo-preview"
    ]
  }
};

async function createTextStream(
    provider = "groq", 
    prompt = "What is love?", 
    model = null,
    stream = true
  ) {
    try {
      // Select the appropriate client and model
      const client = provider === "groq" ? groqClient : openaiClient;
      const selectedModel = model || MODELS[provider].default;

      if (!MODELS[provider].available.includes(selectedModel)) {
        throw new Error(`Invalid model for ${provider}. Available models: ${MODELS[provider].available.join(", ")}`);
      }

      const { textStream } = await streamText({
        model: client(selectedModel),
        prompt: prompt,
        stream: stream
      });
      
      // Create a reader from the stream
      const reader = textStream.getReader();
      let result = '';
      
      // Read the stream
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += value; // Accumulate the chunks
        console.log(value); // Print each chunk as it arrives
      }
      
      return result;
    } catch (error) {
      console.error(`Error generating with ${provider}:`, error);
      throw error;
    }
}

export { createTextStream, MODELS };

// console.log("Starting stream...");
// createTextStream("groq", "What is love?", "deepseek-r1-distill-llama-70b", true)
//   .then(finalResult => console.log("\nFinal result:", finalResult))
//   .catch(error => console.error(error));

