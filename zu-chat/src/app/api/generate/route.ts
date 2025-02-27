import { createObject } from '@/lib/text';
import { getPodcastPrompt } from '@/lib/schemas';
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from 'stream';
import { generateImage } from '@/lib/luma';

interface PodcastSegment {
  speaker: "Speaker 1" | "Speaker 2";
  text: string;
}

interface PodcastResponse {
  title: string;
  segments: PodcastSegment[];
}

const VOICE_IDS = {
  "Speaker 1": "JBFqnCBsd6RMkjVDRZzb",
  "Speaker 2": "ZF6FPAbjXT4488VcRRnw"
} as const;

// Track ongoing image generations
const imageGenerationProgress = new Map<string, string>();

// Helper function to convert stream to buffer
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Initialize the client outside the handler to reuse the connection
const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

export async function POST(req: Request) {
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const { language = "English", minutes = "3", researchSummary } = await req.json();

  // Start the async process
  (async () => {
    try {
      const content = researchSummary || `
## Summary 
Arsenal's 2003-04 season, famously referred to as "The Invincibles," was a remarkable achievement in English football. The team dominated the Premier League, securing an impressive 26 wins with no losses, finishing 11 points ahead of second-placed Chelsea. Their total of 73 goals scored and only 26 conceded highlighted their offensive strength and defensive resilience. Key players played pivotal roles in this success. Thierry Henry led the charge, scoring 30 goals in the Premier League. Robert Pires contributed with 14 goals, while Patrick Vieira added 3 goals and 4 assists, showcasing his midfield influence. Freddie Ljungberg scored 4 crucial goals, and Jens Lehmann's consistent performances between the posts were vital, playing every minute of all 38 matches. Defensively, Kolo Touré stood out with 55 appearances, while Ashley Cole's contributions on the left flank were significant, aiding in both goals and assists. Dennis Bergkamp's presence added experience and versatility to the squad. This season was not just about individual brilliance but also teamwork, exemplified by the cohesive effort of players and staff. The legacy of "The Invincibles" remains a testament to Arsenal's ability to unite talent and determination, cementing their status as one of the Premier League's most successful sides. 
`;

      const prompt = getPodcastPrompt(content, language, minutes);
      console.log('Generated prompt:', prompt);

      const podcast_transcript = await createObject("podcast", prompt, "groq", "llama-3.1-8b-instant");
      console.log('Raw podcast transcript response:', JSON.stringify(podcast_transcript, null, 2));

      if (!Array.isArray(podcast_transcript)) {
        console.error('Podcast transcript is not an array:', podcast_transcript);
        throw new Error('Invalid podcast transcript format - expected array');
      }

      // Start generating first image immediately
      const firstImagePromise = (async () => {
        try {
          console.log(`Generating first image for segment:`, podcast_transcript[0]);
          const imageUrl = await generateImage(podcast_transcript[0].text);
          return {
            speaker: podcast_transcript[0].speaker,
            imageUrl
          };
        } catch (error) {
          console.error(`Error generating first image:`, error);
          return {
            speaker: podcast_transcript[0].speaker,
            imageUrl: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })();

      // Start background processing for remaining images
      if (podcast_transcript.length > 1) {
        const remainingSegments = podcast_transcript.slice(1);
        (async () => {
          for (const segment of remainingSegments) {
            try {
              console.log(`Generating image for segment in background:`, segment);
              const imageUrl = await generateImage(segment.text);
              imageGenerationProgress.set(segment.speaker, imageUrl);
            } catch (error) {
              console.error(`Error generating image for segment:`, error);
              imageGenerationProgress.set(
                segment.speaker, 
                `error:${error instanceof Error ? error.message : 'Unknown error'}`
              );
            }
          }
        })();
      }

      // Generate all audio segments in parallel
      const audioPromises = podcast_transcript.map(async (segment) => {
        console.log(`Preparing audio for segment:`, segment);
        const voiceId = VOICE_IDS[segment.speaker];
        if (!voiceId) {
          console.error('Invalid speaker:', segment.speaker);
          throw new Error(`No voice ID found for ${segment.speaker}`);
        }
        
        try {
          const audioStream = await client.textToSpeech.convert(voiceId, {
            text: segment.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
            output_format: "mp3_44100_128",
          });

          const audioBuffer = await streamToBuffer(audioStream as unknown as Readable);
          return audioBuffer.toString('base64');
        } catch (error: unknown) {
          console.error(`Error generating audio for segment:`, error);
          throw new Error(`Failed to generate audio for segment: ${error instanceof Error ? error.message : String(error)}`);
        }
      });

      // Wait for first image and all audio segments to complete
      const [firstImage, ...audioSegments] = await Promise.all([
        firstImagePromise,
        ...audioPromises
      ]);
      
      console.log(`Successfully generated ${audioSegments.length} audio segments and first image`);
      
      // Send the audio segments, first image, and transcript as response
      await writer.write(encoder.encode(JSON.stringify({
        audioSegments,
        images: [firstImage],
        remainingImageSegments: podcast_transcript.slice(1).map(s => s.speaker),
        transcript: podcast_transcript,
      })));
    } catch (error: unknown) {
      console.error('Error in generation:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      await writer.write(encoder.encode(JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to generate podcast'
      })));
    } finally {
      await writer.close();
    }
  })();

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Endpoint to check progress of remaining images
export async function GET(req: Request) {
  const results = Array.from(imageGenerationProgress.entries()).map(([speaker, result]) => {
    if (result.startsWith('error:')) {
      return {
        speaker,
        imageUrl: null,
        error: result.substring(6)
      };
    }
    return {
      speaker,
      imageUrl: result
    };
  });

  return Response.json({ images: results });
} 