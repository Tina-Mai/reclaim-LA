import { ElevenLabsClient, play } from "elevenlabs";

interface PodcastSegment {
  speaker: string;
  text: string;
}

// Voice IDs for different speakers
const VOICE_IDS = {
  "Speaker 1": "JBFqnCBsd6RMkjVDRZzb",
  "Speaker 2": "ZF6FPAbjXT4488VcRRnw"
};

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function playPodcastTranscript(transcript: PodcastSegment[]) {
  try {
    // Generate all audio segments in parallel
    const audioPromises = transcript.map(segment => {
      const voiceId = VOICE_IDS[segment.speaker];
      if (!voiceId) {
        throw new Error(`No voice ID found for ${segment.speaker}`);
      }
      
      return client.textToSpeech.convert(voiceId, {
        text: segment.text,
        model_id: "eleven_multilingual_v2", 
        output_format: "mp3_44100_128",
      });
    });

    // Wait for all audio segments to be generated
    const audioSegments = await Promise.all(audioPromises);

    // Play each segment sequentially
    for (const audio of audioSegments) {
      await play(audio);
    }
  } catch (error) {
    console.error('Error in playPodcastTranscript:', error);
    throw error;
  }
}

export { VOICE_IDS }; 