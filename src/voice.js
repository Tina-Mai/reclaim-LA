import { ElevenLabsClient, play } from "elevenlabs";
import dotenv from "dotenv";

dotenv.config();

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Voice IDs for different speakers
const VOICE_IDS = {
  SPEAKER_1: "JBFqnCBsd6RMkjVDRZzb",
  SPEAKER_2: "ZF6FPAbjXT4488VcRRnw"
};

async function textToSpeech(voiceId = "JBFqnCBsd6RMkjVDRZzb", 
  text = "The first move is what sets everything in motion.") {
  try {
    const audio = await client.textToSpeech.convert(voiceId, {
      text: text,
      model_id: "eleven_multilingual_v2",
      output_format: "mp3_44100_128",
    });

    await play(audio);
  } catch (error) {
    console.error('Error in textToSpeech:', error);
  }
}

async function playPodcastTranscript(transcript) {
  try {
    // First, generate all audio segments in parallel
    const audioPromises = transcript.map(segment => {
      const voiceId = segment.speaker === "Speaker 1" 
        ? "JBFqnCBsd6RMkjVDRZzb"  // default voice for Speaker 1
        : "ZF6FPAbjXT4488VcRRnw"; // different voice for Speaker 2
      
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
  }
}

export { textToSpeech, playPodcastTranscript, VOICE_IDS };
