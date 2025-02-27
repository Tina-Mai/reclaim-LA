import { LumaAI } from 'lumaai';
import { createText } from './text';

const client = new LumaAI({
  apiKey: process.env.LUMAAI_API_KEY
});

export async function generateImage(speakerText: string): Promise<string> {
  console.log('=== Starting image generation ===');
  console.log('Input text:', speakerText);

  let prompt_to_use = await generatePromptForSpeaker(speakerText);
  console.log('Final prompt to use:', prompt_to_use);

  console.log('Calling Luma API to create image...');
  let generation = await client.generations.image.create({
    prompt: prompt_to_use
  });
  console.log('Initial generation ID:', generation.id);

  let completed = false;
  let attempts = 0;

  while (!completed) {
    attempts++;
    console.log(`Checking generation status (attempt ${attempts})...`);
    generation = await client.generations.get(generation.id);
    console.log('Current state:', generation.state);

    if (generation.state === "completed") {
      completed = true;
      console.log('Generation completed successfully');
    } else if (generation.state === "failed") {
      console.error('Generation failed:', generation.failure_reason);
      throw new Error(`Generation failed: ${generation.failure_reason}`);
    } else {
      console.log('Still processing, waiting 3 seconds...');
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log('=== Image generation complete ===');
  return generation.assets.image;
}

export async function generatePromptForSpeaker(text: string): Promise<string> {
  console.log('=== Starting prompt generation ===');
  console.log('Raw input text:', text);
  
  const prompt = await createText(
    "groq", 
    `You are an expert content creator. Generate an image prompt based on this podcast segment:
    "${text}"
    
    Rules:
    1. Focus on the TOPIC being discussed, not the speaker or podcast format
    2. Create a vivid, detailed scene that represents the main subject
    3. Avoid mentioning that this is for a podcast
    4. Keep the prompt concise but descriptive
    5. Always end with: Style: photorealistic, high quality, detailed
    
    Output the image prompt directly, with no additional text or explanations.`,
    "llama-3.1-8b-instant"
  );

  // Clean up any extra quotes or newlines that might have been added
  const cleanedPrompt = prompt
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .trim();

  console.log('Raw prompt from LLM:', prompt);
  console.log('Cleaned prompt:', cleanedPrompt);
  console.log('=== Prompt generation complete ===');

  return cleanedPrompt;
} 