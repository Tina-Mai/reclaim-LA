import { generateText, generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { openai } from "@ai-sdk/openai";
import { Schemas } from './schemas';

const MODELS = {
  groq: {
    default: "deepseek-r1-distill-llama-70b" as const,
    available: [
      "deepseek-r1-distill-llama-70b",
      "llama2-70b-4096",
      "mixtral-8x7b-32768",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "gemma2-9b-it"
    ] as const
  },
  openai: {
    default: "gpt-3.5-turbo" as const,
    available: [
      "gpt-4",
      "gpt-3.5-turbo",
      "gpt-4-turbo-preview"
    ] as const
  }
} as const;

type Provider = keyof typeof MODELS;
type GroqModel = (typeof MODELS)['groq']['available'][number];
type OpenAIModel = (typeof MODELS)['openai']['available'][number];
type AnyModel = GroqModel | OpenAIModel;

function isValidModel(provider: Provider, model: string): model is AnyModel {
  return (MODELS[provider].available as readonly string[]).includes(model);
}

export async function createText(
  provider: Provider = "groq", 
  prompt = "What is love?", 
  model: AnyModel | null = null
) {
  try {
    const client = provider === "groq" ? groq : openai;
    const selectedModel = model || MODELS[provider].default;

    if (!isValidModel(provider, selectedModel)) {
      throw new Error(`Invalid model for ${provider}. Available models: ${MODELS[provider].available.join(", ")}`);
    }

    const { text } = await generateText({
      model: client(selectedModel),
      prompt: prompt
    });
    return text;
  } catch (error) {
    console.error(`Error generating with ${provider}:`, error);
    throw error;
  }
}

export async function createObject(
  schemaName: keyof typeof Schemas,
  customPrompt: string | null = null,
  provider: Provider = "groq",
  model: AnyModel | null = null,
) {
  try {
    console.log('Creating object with:', { schemaName, provider, model });
    console.log('Using prompt:', customPrompt);

    const schema = Schemas[schemaName];
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found. Available schemas: ${Object.keys(Schemas).join(", ")}`);
    }

    const client = provider === "groq" ? groq : openai;
    const selectedModel = model || MODELS[provider].default;

    if (!isValidModel(provider, selectedModel)) {
      throw new Error(`Invalid model for ${provider}. Available models: ${MODELS[provider].available.join(", ")}`);
    }

    // For podcast transcripts, we'll handle the response differently
    if (schemaName === 'podcast' && customPrompt) {
      const { text } = await generateText({
        model: client(selectedModel),
        prompt: customPrompt
      });

      // Log the raw response for debugging
      console.log('Raw model response:', text);

      try {
        // First try to parse the entire response as a JSON array
        try {
          // Clean up the text - remove any text before the first [ and after the last ]
          const jsonStart = text.indexOf('[');
          const jsonEnd = text.lastIndexOf(']') + 1;
          if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('No JSON array found in response');
          }
          const jsonText = text.slice(jsonStart, jsonEnd);
          
          // Parse the cleaned JSON
          const segments = JSON.parse(jsonText);
          console.log('Successfully parsed complete JSON response:', segments);
          
          if (!Array.isArray(segments)) {
            throw new Error('Parsed result is not an array');
          }
          
          const transcript = segments.map(segment => ({
            speaker: segment.speaker as "Speaker 1" | "Speaker 2",
            text: segment.text.trim()
          }));

          // Validate against our schema
          const parsed = schema.parse(transcript);
          return parsed;
        } catch (parseError) {
          console.log('Failed to parse complete JSON, trying segment-by-segment parsing');
          console.log('Parse error:', parseError);
          
          // If that fails, try to extract individual JSON objects
          const segmentMatches = text.match(/\{\s*"speaker"\s*:\s*"[^"]+"\s*,\s*"text"\s*:\s*"[^"]+"\s*\}/g);
          if (!segmentMatches) {
            throw new Error('No valid segments found in response');
          }

          const segments = segmentMatches.map(segment => {
            try {
              return JSON.parse(segment);
            } catch (err) {
              console.log('Failed to parse segment:', segment);
              throw new Error(`Invalid segment format: ${segment}`);
            }
          });

          console.log('Successfully parsed segments:', segments);

          const transcript = segments.map(segment => ({
            speaker: segment.speaker as "Speaker 1" | "Speaker 2",
            text: segment.text.trim()
          }));

          // Validate against our schema
          const parsed = schema.parse(transcript);
          return parsed;
        }
      } catch (error) {
        console.error('Error parsing response:', error);
        console.error('Parse error details:', error instanceof Error ? error.message : String(error));
        throw new Error('Failed to parse model response into valid transcript format');
      }
    }

    // For other schema types, use generateObject
    const result = await generateObject({
      model: client(selectedModel),
      prompt: customPrompt || undefined,
      schema: schema,
    });

    return result;
  } catch (error) {
    console.error(`Error generating object with ${provider}:`, error);
    throw error;
  }
}

export { MODELS }; 