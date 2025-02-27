import { generateImage } from '@/lib/luma';
import { PodcastTranscriptSchema } from '@/lib/schemas';

// Track ongoing image generations
const imageGenerationProgress = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();
    
    // Validate transcript
    const validatedTranscript = PodcastTranscriptSchema.parse(transcript);

    // Generate first image and start others in background
    const firstSegment = validatedTranscript[0];
    let firstImageResult;

    try {
      console.log(`Generating first image for segment:`, firstSegment);
      const imageUrl = await generateImage(firstSegment.text);
      firstImageResult = {
        speaker: firstSegment.speaker,
        imageUrl
      };
    } catch (error) {
      console.error(`Error generating first image:`, error);
      firstImageResult = {
        speaker: firstSegment.speaker,
        imageUrl: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Start background processing for remaining images
    if (validatedTranscript.length > 1) {
      const remainingSegments = validatedTranscript.slice(1);
      
      // Process remaining images in the background
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

    // Return immediately with first image result
    return Response.json({ 
      images: [firstImageResult],
      remainingSegments: validatedTranscript.slice(1).map(s => s.speaker)
    });
  } catch (error) {
    console.error('Error in image generation:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to generate images' },
      { status: 500 }
    );
  }
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