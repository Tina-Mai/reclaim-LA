"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "ai/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PodcastControls } from "@/components/podcast/PodcastControls";
import { PodcastPlayer } from "@/components/podcast/PodcastPlayer";
import { ResearchHeader } from "@/components/research/ResearchHeader";
import { ResearchPerspectives } from "@/components/research/ResearchPerspectives";
import { DEFAULT_RESEARCH_SUMMARY } from "@/lib/constants";
import { useConversation } from "@11labs/react";

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Spanish", label: "Spanish" },
  { value: "Chinese", label: "Chinese" },
  { value: "Russian", label: "Russian" },
  { value: "Arabic", label: "Arabic" },
  { value: "Japanese", label: "Japanese" },
  { value: "Korean", label: "Korean" },
  { value: "French", label: "French" },
  { value: "German", label: "German" },
  { value: "Italian", label: "Italian" },
  { value: "Portuguese", label: "Portuguese" },
] as const;

const DURATIONS = [
  { value: "1", label: "1 minute" },
  { value: "2", label: "2 minutes" },
  { value: "3", label: "3 minutes" },
  { value: "5", label: "5 minutes" },
] as const;

interface SpeakerImage {
  speaker: string;
  imageUrl: string | null;
  error?: string;
}

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [language, setLanguage] = useState("English");
  const [duration, setDuration] = useState("3");
  const [audioSegments, setAudioSegments] = useState<ArrayBuffer[]>([]);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [displayedMessages, setDisplayedMessages] = useState<any[]>([]);
  const [speakerImages, setSpeakerImages] = useState<SpeakerImage[]>([]);
  const [trackOne, setTrackOne] = useState<string | null>(null);
  const [trackTwo, setTrackTwo] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<"one" | "two">("one");
  const audioRef = useRef<HTMLAudioElement>(null);
  const { messages, setMessages } = useChat();
  const [isTestMode, setIsTestMode] = useState(false);

  useEffect(() => {
    // Load research summaries from localStorage
    const trackOne = localStorage.getItem("researchSummaryTrackOne");
    const trackTwo = localStorage.getItem("researchSummaryTrackTwo");
    if (trackOne) setTrackOne(trackOne);
    if (trackTwo) setTrackTwo(trackTwo);
  }, []);

  useEffect(() => {
    // Handle audio playback and transcript synchronization
    if (isReady && audioSegments.length > 0 && currentSegment < audioSegments.length) {
      const audio = audioRef.current;
      if (audio) {
        // Stop any current playback
        audio.pause();

        // Create and play the new segment
        const blob = new Blob([audioSegments[currentSegment]], { type: "audio/mpeg" });
        const url = URL.createObjectURL(blob);
        audio.src = url;

        // Start playing automatically
        audio.play().catch((error) => {
          console.error("Error playing audio:", error);
        });

        // Clean up previous URL if it exists
        if (audio.dataset.previousUrl) {
          URL.revokeObjectURL(audio.dataset.previousUrl);
        }
        audio.dataset.previousUrl = url;

        // Update displayed message if not already shown
        if (!displayedMessages[currentSegment]) {
          setDisplayedMessages((prev) => {
            const newMessages = [...prev];
            newMessages[currentSegment] = {
              role: "assistant",
              content: `${transcript[currentSegment].speaker}: ${transcript[currentSegment].text}`,
            };
            return newMessages;
          });
        }

        audio.onended = () => {
          if (currentSegment < audioSegments.length - 1) {
            setCurrentSegment((prev) => prev + 1);
          }
        };

        // Cleanup function
        return () => {
          audio.pause();
          if (audio.dataset.previousUrl) {
            URL.revokeObjectURL(audio.dataset.previousUrl);
          }
        };
      }
    }
  }, [audioSegments, currentSegment, transcript, isReady, displayedMessages]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsReady(false);
    setDisplayedMessages([]);
    setCurrentSegment(0);
    setSpeakerImages([]);

    try {
      const researchSummary = selectedTrack === "one" ? trackOne : trackTwo;

      // Generate podcast audio
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          minutes: duration,
          researchSummary: researchSummary || DEFAULT_RESEARCH_SUMMARY,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate podcast");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Convert base64 audio segments to ArrayBuffer
      const segments = data.audioSegments.map((base64Audio: string) => {
        try {
          const binaryString = atob(base64Audio);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes.buffer;
        } catch (error) {
          console.error("Error decoding audio segment:", error);
          throw new Error("Failed to decode audio data");
        }
      });

      setAudioSegments(segments);
      setTranscript(data.transcript);

      // Generate images for all segments
      setIsGeneratingImages(true);
      try {
        const imageResponse = await fetch("/api/generate/images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript: data.transcript,
          }),
        });

        if (!imageResponse.ok) {
          throw new Error("Failed to generate images");
        }

        const imageData = await imageResponse.json();
        if (imageData.error) {
          throw new Error(imageData.error);
        }

        setSpeakerImages(imageData.images);
        setIsReady(true);
      } catch (error) {
        console.error("Error generating images:", error);
        setIsReady(true);
      } finally {
        setIsGeneratingImages(false);
      }

      // Clear the research summaries after successful generation
      localStorage.removeItem("researchSummaryTrackOne");
      localStorage.removeItem("researchSummaryTrackTwo");
      setTrackOne(null);
      setTrackTwo(null);
    } catch (error) {
      console.error("Generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate podcast");
    } finally {
      setIsGenerating(false);
    }
  };

  const [isListening, setIsListening] = useState(false);
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to conversation");
    },
    onDisconnect: () => {
      console.log("Disconnected from conversation");
      setIsListening(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      setIsListening(false);
    },
  });

  const { status, isSpeaking } = conversation;

  const startConversation = async () => {
    try {
      // Request microphone access
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent ID
      const conversationId = await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID,
      });

      console.log("Started conversation:", conversationId);
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const stopConversation = async () => {
    try {
      await conversation.endSession();
      setIsListening(false);
    } catch (error) {
      console.error("Failed to stop conversation:", error);
    }
  };

  const adjustVolume = async (volume: number) => {
    try {
      await conversation.setVolume({ volume });
    } catch (error) {
      console.error("Failed to adjust volume:", error);
    }
  };

  return (
    <div className="container mx-auto px-8 py-20">
      <ResearchHeader title="Podcast Generator" />

      {(trackOne || trackTwo) && (
        <ResearchPerspectives
          trackOne={trackOne}
          trackTwo={trackTwo}
          selectedTrack={selectedTrack}
          onSelectTrack={setSelectedTrack}
        />
      )}

      <PodcastControls
        language={language}
        duration={duration}
        isGenerating={isGenerating}
        onLanguageChange={setLanguage}
        onDurationChange={setDuration}
        onGenerate={handleGenerate}
      />

      <audio ref={audioRef} className="hidden" />

      {displayedMessages.length > 0 && (
        <div className="mt-6">
          <PodcastPlayer
            content={displayedMessages[currentSegment]?.content}
            imageUrl={speakerImages[currentSegment]?.imageUrl}
            audioRef={audioRef}
            currentSegment={currentSegment}
            totalSegments={displayedMessages.length}
            onNext={() => {
              if (currentSegment < displayedMessages.length - 1) {
                setCurrentSegment((prev) => prev + 1);
              }
            }}
            onPrevious={() => {
              if (currentSegment > 0) {
                setCurrentSegment((prev) => prev - 1);
              }
            }}
          />
        </div>
      )}

      {displayedMessages.length > 0 && (
        <div className="container mx-auto py-16">
          <Card className="p-8 mx-auto bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 shadow-lg">
            <h2 className="mb-8 pb-4 border-b dark:border-gray-800">Feynman Review</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        status === "connected" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <p className="text-sm font-medium">Status: {status}</p>
                  </div>
                  {isSpeaking && (
                    <p className="text-sm flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      Agent is speaking...
                    </p>
                  )}
                </div>
                <Button
                  onClick={isListening ? stopConversation : startConversation}
                  variant={isListening ? "destructive" : "default"}
                  className="min-w-[160px]"
                >
                  {isListening ? "Stop Conversation" : "Start Conversation"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Volume Control</p>
                  <p className="text-xs text-gray-500">Adjust speaker volume</p>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.5"
                  onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                  className="w-full accent-gray-500 dark:accent-gray-400"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
