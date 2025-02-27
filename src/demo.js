import { playPodcastTranscript } from './voice.js';
import { createObject } from './text.js';
import { getPodcastPrompt } from './schemas.js';
import { generateImage } from './luma.js';
const report = `
## Summary 
Arsenal's 2003-04 season, famously referred to as "The Invincibles," was a remarkable achievement in English football. The team dominated the Premier League, securing an impressive 26 wins with no losses, finishing 11 points ahead of second-placed Chelsea. Their total of 73 goals scored and only 26 conceded highlighted their offensive strength and defensive resilience. Key players played pivotal roles in this success. Thierry Henry led the charge, scoring 30 goals in the Premier League. Robert Pires contributed with 14 goals, while Patrick Vieira added 3 goals and 4 assists, showcasing his midfield influence. Freddie Ljungberg scored 4 crucial goals, and Jens Lehmann's consistent performances between the posts were vital, playing every minute of all 38 matches. Defensively, Kolo Touré stood out with 55 appearances, while Ashley Cole's contributions on the left flank were significant, aiding in both goals and assists. Dennis Bergkamp's presence added experience and versatility to the squad. This season was not just about individual brilliance but also teamwork, exemplified by the cohesive effort of players and staff. The legacy of "The Invincibles" remains a testament to Arsenal's ability to unite talent and determination, cementing their status as one of the Premier League's most successful sides. 
`;

async function main() {

    // try {
    //     const prompt = "A soccer team celebrating on a field, with players wearing red jerseys, in a photorealistic style";
    //     console.log("Generating image with Luma AI...");
    //     await generateImage(prompt);
    // } catch (error) {
    //     console.error('Error:', error);
    // }
  try {
    const prompt = getPodcastPrompt(report, "Spanish", "2");
    const podcast_transcript = await createObject("podcast", prompt, "groq", "llama-3.1-8b-instant");
    console.log('Generated transcript:', JSON.stringify(podcast_transcript, null, 2));
    await playPodcastTranscript(podcast_transcript);
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 