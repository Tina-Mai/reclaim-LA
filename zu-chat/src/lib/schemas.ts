import { z } from 'zod';

// Basic podcast transcript schema
export const PodcastTranscriptSchema = z.array(
  z.object({
    speaker: z.enum(["Speaker 1", "Speaker 2"]),
    text: z.string().min(1).max(500)
  })
).min(1).max(20); // Ensure we have at least 1 segment and not too many

// Example schemas for different use cases
export const Schemas = {
  podcast: PodcastTranscriptSchema,
} as const;

// export function verifyPodcast(report: string, transcript: string, language = "English", minutes = "3") {
//   return `
//   You are given a podcast that should be in format: \n
//   {
//     "speaker": "Speaker 1",
//     "text": "Your text here in ${language}"
//   } \n
//   Where each bit of text is a complete sentence.

//   This podcast has been generated about the following report: \n
//   ${report} \n

//   The podcast is ${minutes} minutes long.

//   The podcast is in ${language}.

//   Your job is to verify that the podcast is in the correct format and that each bit of text is a complete sentence.
//   If it is not, you should correct it.

//   You should return the corrected podcast in the same format as the original podcast.

//   Here is the podcast: \n
//   ${transcript} \n

//   Here is the corrected podcast: \n
//   `
// }

// Create a function to generate the prompt with the report
export function getPodcastPrompt(report: string, language = "English", minutes = "5") {
  return `
  You are an expert podcast script writer for multi-speaker podcasts.
  You are writing this podcast in ${language}. This podcast will be ${minutes} minutes long.

  Generate a natural conversation between two speakers discussing the following report.
  IMPORTANT: Each response MUST be in valid JSON format with "speaker" and "text" fields in English,
  even though the text content will be in ${language}.

  The research report is as follows:
  ${report}

  Rules for the conversation:
  1. Use filler words appropriate for ${language}
  2. Include some light humor and casual banter
  3. Keep each response concise and natural
  4. Alternate between Speaker 1 and Speaker 2
  5. Format each response EXACTLY like this example (keep "speaker" in English):
  {
    "speaker": "Speaker 1",
    "text": "Your text here in ${language} in complete sentences"
  }

  Begin the conversation, which is written in ${language}, and will be ${minutes} minutes long.
  Remember to keep the JSON format exactly as shown, with "speaker" and "text" in double quotes:
  `;
}
