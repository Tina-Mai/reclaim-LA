"use client";

import { useEffect, useState } from "react";
import { useConversation } from "@11labs/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function TestPage() {
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
    <div className="container mx-auto px-4 py-16">
      <Card className="p-6 max-w-2xl mx-auto">
        <h1 className="mb-6 font-mono">Feynman Review</h1>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status: {status}</p>
              {isSpeaking && <p className="text-sm text-blue-600">Agent is speaking...</p>}
            </div>
            <Button
              onClick={isListening ? stopConversation : startConversation}
              variant={isListening ? "destructive" : "default"}
            >
              {isListening ? "Stop Conversation" : "Start Conversation"}
            </Button>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Volume</p>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              defaultValue="0.5"
              onChange={(e) => adjustVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
