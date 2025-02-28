"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./App.css";
import { ResearchFlow } from "@/components/ResearchFlow";

interface DebatePerspectives {
  perspective_one: string;
  perspective_two: string;
  topic: string;
}

interface StatusUpdate {
  phase: string;
  message: string;
  elapsed_time: number;
  timestamp: number;
  summary?: string;
  chain_of_thought?: string;
  track?: string;
  perspectives?: DebatePerspectives;
}

interface StatusMessage {
  phase: string;
  message: string;
  timestamp: number;
  chain_of_thought?: string;
  track?: string;
  perspectives?: DebatePerspectives;
}

interface ResearchConfig {
  local_llm: string;
  max_web_research_loops: number;
  research_mode: "local" | "remote";
  groq_model: string;
  groq_api_key?: string;
}

interface ResearchSource {
  title: string;
  url: string;
  content: string;
  sourceNumber: number;
  domain: string;
}

interface SourceListProps {
  sources: ResearchSource[];
  title: string;
}

const SourceList = ({ sources, title }: SourceListProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {sources.map((source, index) => {
          const faviconUrl =
            source.url !== "#"
              ? `https://www.google.com/s2/favicons?domain=${source.domain}&sz=32`
              : "/default-favicon.png";

          return (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex-shrink-0 w-[300px] ${
                    source.url === "#" ? "cursor-not-allowed" : ""
                  }`}
                  onClick={source.url === "#" ? (e) => e.preventDefault() : undefined}
                >
                  <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 h-full">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-gray-500 text-sm min-w-[24px] font-medium">
                        {source.sourceNumber}
                      </span>
                      <div className="w-8 h-8 relative flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={faviconUrl}
                          alt={source.domain || "favicon"}
                          width={32}
                          height={32}
                          className="rounded-lg"
                          onError={(e) => {
                            const imgElement = e.target as HTMLImageElement;
                            imgElement.src = "/default-favicon.png";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{source.title}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {source.domain || "Unknown source"}
                        </p>
                      </div>
                    </div>
                  </div>
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-80" side="top" align="center" sideOffset={8}>
                <div className="flex justify-between space-x-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{source.title}</h4>
                    <p className="text-sm text-gray-600">{source.domain}</p>
                    <div className="flex items-center pt-2">
                      <span className="text-xs text-gray-500">Click to visit source</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 relative bg-gray-200 rounded-lg overflow-hidden">
                    <Image
                      src={faviconUrl}
                      alt={source.domain || "favicon"}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.src = "/default-favicon.png";
                      }}
                    />
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>
    </div>
  );
};

const formatMessage = (message: string, chain_of_thought?: { content: string }) => {
  // Remove the phase prefix if it exists
  const cleanMessage = message.replace(/^\[[^\]]+\]\s*/, "");

  // If there's chain of thought, format it specially
  if (chain_of_thought) {
    return (
      <div>
        <div>{cleanMessage}</div>
        <div className="bg-yellow-50 p-3 rounded-md my-2">
          <div className="text-yellow-600 font-medium mb-1">Chain of Thought:</div>
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {chain_of_thought.content}
          </div>
        </div>
      </div>
    );
  }

  // If the message contains <think>, format it specially
  if (cleanMessage.includes("<think>")) {
    const thinkingContent = cleanMessage.split("<think>")[1].split("</think>")[0].trim();
    return (
      <div className="bg-blue-50 p-3 rounded-md my-2">
        <div className="text-blue-600 font-medium mb-1">Thinking Process:</div>
        <div className="whitespace-pre-wrap text-sm text-gray-700">{thinkingContent}</div>
      </div>
    );
  }

  // If it's JSON, try to format it
  if (cleanMessage.includes("{") && cleanMessage.includes("}")) {
    try {
      const jsonStart = cleanMessage.indexOf("{");
      const jsonEnd = cleanMessage.lastIndexOf("}") + 1;
      const jsonStr = cleanMessage.slice(jsonStart, jsonEnd);
      const jsonObj = JSON.parse(jsonStr);
      const beforeJson = cleanMessage.slice(0, jsonStart);
      const afterJson = cleanMessage.slice(jsonEnd);

      return (
        <div>
          {beforeJson && <div>{beforeJson}</div>}
          <pre className="bg-gray-100 p-2 rounded-md my-1 text-sm">
            {JSON.stringify(jsonObj, null, 2)}
          </pre>
          {afterJson && <div>{afterJson}</div>}
        </div>
      );
    } catch (_e) {
      return cleanMessage;
    }
  }

  return cleanMessage;
};

export default function ResearchPage() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [summary, setSummary] = useState("");
  const [currentLoop, setCurrentLoop] = useState(0);
  const [totalLoops, setTotalLoops] = useState(0);
  const [statusHistory, setStatusHistory] = useState<StatusMessage[]>([]);
  const [statusSource, setStatusSource] = useState<EventSource | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1 second
  const [config, setConfig] = useState<ResearchConfig | null>(null);
  const [isRemoteMode, setIsRemoteMode] = useState(false);

  console.log("statusHistory", statusHistory);

  const BACKEND_URL = process.env.NEXT_PUBLIC_RESEARCHER_URL || "http://localhost:4000";

  useEffect(() => {
    // Cleanup function to close SSE connection when component unmounts
    return () => {
      if (statusSource) {
        statusSource.close();
      }
    };
  }, [statusSource]);

  useEffect(() => {
    // Load initial configuration
    const loadConfig = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/config`, {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to load configuration");
        }
        const data = await response.json();
        setConfig(data);
        setIsRemoteMode(data.research_mode === "remote");
      } catch (error) {
        console.error("Failed to load configuration:", error);
      }
    };
    loadConfig();
  }, [BACKEND_URL]);

  const setupSSEConnection = () => {
    if (statusSource) {
      statusSource.close();
      setStatusSource(null);
    }

    const eventSource = new EventSource(`${BACKEND_URL}/status`, {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as StatusUpdate;
        console.log("Received status update:", data);

        setStatus(data.message);

        setRetryCount(0); // Reset retry count on successful message

        // Update loop progress
        if (data.message.includes("Starting research loop")) {
          console.log("Starting research loop");
          const match = data.message.match(/loop (\d+) of (\d+)/);
          if (match) {
            setCurrentLoop(parseInt(match[1]));
            setTotalLoops(parseInt(match[2]));
          }
        }

        let chain_of_thought = null;
        if (data.chain_of_thought) {
          try {
            chain_of_thought = JSON.parse(data.chain_of_thought);
            console.log("chain_of_thought", chain_of_thought);
          } catch (_error) {
            chain_of_thought = { content: data.chain_of_thought };
          }
        }

        // Add to status history
        setStatusHistory((prev) => [
          ...prev,
          {
            phase: data.phase,
            message: data.message,
            timestamp: data.timestamp,
            chain_of_thought: chain_of_thought,
            track: data.track,
            perspectives: data.perspectives,
          },
        ]);

        if (data.phase === "complete") {
          setSummary(data.message);
          eventSource.close();
          setStatusSource(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to parse SSE data:", error, event.data);
      }
    };

    eventSource.onerror = async (error) => {
      console.error("SSE error:", error);
      eventSource.close();
      setStatusSource(null);

      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying SSE connection (${retryCount + 1}/${MAX_RETRIES})...`);
        setRetryCount((prev) => prev + 1);
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * Math.pow(2, retryCount)));
        setupSSEConnection();
      } else {
        setIsLoading(false);
        setStatus("Error: Lost connection to research service");
        setStatusHistory((prev) => [
          ...prev,
          {
            phase: "error",
            message: "Lost connection to research service",
            timestamp: Date.now() / 1000,
          },
        ]);
      }
    };

    eventSource.onopen = () => {
      console.log("SSE connection opened");
      setRetryCount(0);
    };

    return eventSource;
  };

  const handleResearch = async (topic: string) => {
    setSummary("");
    setStatus("Starting research...");
    setCurrentLoop(0);
    setTotalLoops(0);
    setStatusHistory([]);
    setRetryCount(0);

    try {
      // First establish SSE connection
      const eventSource = setupSSEConnection();
      setStatusSource(eventSource);

      // Now start the research process
      const response = await fetch(`${BACKEND_URL}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic }),
        credentials: "include",
      });

      if (!response.ok) {
        let errorMessage = "Research request failed";
        try {
          const errorData = await response.json();
          if (errorData && typeof errorData.error === "string") {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        throw new Error(errorMessage);
      }

      // Only try to parse response if we need it
      // const data = await response.json();
      // No need to do anything with the response as we'll get updates via SSE
    } catch (error) {
      console.error("Research error:", error);
      setIsLoading(false);
      setStatus(error instanceof Error ? error.message : "Failed to start research");
      setStatusHistory((prev) => [
        ...prev,
        {
          phase: "error",
          message: error instanceof Error ? error.message : "Failed to start research",
          timestamp: Date.now() / 1000,
        },
      ]);
      if (statusSource) {
        statusSource.close();
        setStatusSource(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await handleResearch(topic);
  };

  const handleCreatePodcast = () => {
    // Extract track one and track two from the summary
    const trackOneMatch = summary.match(/### Track One\n([\s\S]*?)(?=\n### Track One Sources:)/);
    const trackTwoMatch = summary.match(/### Track Two\n([\s\S]*?)(?=\n### Track Two Sources:)/);

    const trackOne = trackOneMatch ? trackOneMatch[1].trim() : "";
    const trackTwo = trackTwoMatch ? trackTwoMatch[1].trim() : "";

    // Store both tracks in localStorage
    localStorage.setItem("researchSummaryTrackOne", trackOne);
    localStorage.setItem("researchSummaryTrackTwo", trackTwo);

    // Navigate to the podcast creation page
    router.push("/");
  };

  const handleModeChange = async (checked: boolean) => {
    try {
      setIsRemoteMode(checked);
      const response = await fetch(`${BACKEND_URL}/config`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          research_mode: checked ? "remote" : "local",
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to update configuration");
      }

      setConfig((prev) => (prev ? { ...prev, research_mode: checked ? "remote" : "local" } : null));
    } catch (error) {
      console.error("Failed to update configuration:", error);
      setIsRemoteMode(!checked);
    }
  };

  // Group status messages by loop
  const groupedStatusHistory = statusHistory.reduce((groups, status) => {
    let loop = 0;
    if (status.message.includes("Starting research loop")) {
      const match = status.message.match(/loop (\d+) of/);
      if (match) {
        loop = parseInt(match[1]);
      }
    } else if (status.phase === "query" || status.phase === "init") {
      loop = 0; // Initial setup phase
    } else if (status.phase === "final" || status.phase === "complete") {
      loop = -1; // Final phase
    } else {
      // Find the most recent loop number from previous messages
      for (let i = groups.length - 1; i >= 0; i--) {
        if (groups[i].loop !== undefined) {
          loop = groups[i].loop;
          break;
        }
      }
    }

    return [...groups, { ...status, loop }];
  }, [] as Array<StatusMessage & { loop: number }>);

  const formatMessageWithType = (
    message: string,
    chain_of_thought?: string | { content: string }
  ) => {
    if (typeof chain_of_thought === "string") {
      return formatMessage(message, { content: chain_of_thought });
    }
    return formatMessage(message, chain_of_thought);
  };

  // Update the source parsing function
  const parseSourcesFromText = (sourcesText: string): ResearchSource[] => {
    const sourceLines = sourcesText
      .split("\n")
      .filter((line) => line.trim())
      .filter((line, index, self) => {
        // Remove duplicates by checking if this is the first occurrence of the line
        return self.indexOf(line) === index;
      });

    return sourceLines.map((line, index) => {
      const matches = line.match(/(?:Perplexity Search \d+, )?Source \d+ \((.*?)\)/);
      if (matches) {
        const url = matches[1];
        try {
          const domain = new URL(url).hostname;
          return {
            title: `Source ${index + 1}`,
            url,
            content: "",
            sourceNumber: index + 1,
            domain,
          };
        } catch (e) {
          return {
            title: `Source ${index + 1}`,
            url: "#",
            content: "",
            sourceNumber: index + 1,
            domain: "Invalid URL",
          };
        }
      }
      return {
        title: `Source ${index + 1}`,
        url: "#",
        content: "",
        sourceNumber: index + 1,
        domain: "Unknown source",
      };
    });
  };

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-6">
        <h1 className="text-5xl font-bold font-mono">Zue Research</h1>
        <div className="mt-8 mb-4 p-4 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="">Research Mode</h3>
              <p className="text-sm text-gray-600">
                {isRemoteMode ? "Using Groq API for research" : "Using local Ollama for research"}
              </p>
            </div>
            <Switch
              checked={isRemoteMode}
              onCheckedChange={handleModeChange}
              disabled={isLoading}
            />
          </div>
          {/* {isRemoteMode && !config?.groq_api_key && (
            <div className="mt-2 text-sm text-yellow-600">
              Warning: Groq API key not configured. Please add it to your .env file.
            </div>
          )} */}
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 flex flex-col justify-center">
          <div>
            <Label htmlFor="topic">Research Topic</Label>
            <Input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic to research..."
              disabled={isLoading}
            />
          </div>
          <Button
            // type="submit"
            disabled={isLoading || !topic}
            size="lg"
            className="font-mono"
            // className="w-full bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          >
            {isLoading ? "Researching..." : "Start Research"}
          </Button>
        </form>
      </div>

      {isLoading && (
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-black h-2.5 rounded-full"
                style={{ width: `${(currentLoop / totalLoops) * 100}%` }}
              ></div>
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {currentLoop}/{totalLoops}
            </span>
          </div>
          <p className="text-sm text-gray-600">{status}</p>
        </div>
      )}

      {statusHistory.length > 0 && (
        <div className="space-y-4">
          {/* Show debate perspectives if available */}
          {statusHistory.some((s) => s.perspectives) && (
            <div className="mb-6">
              <h3 className="mb-4">Debate Perspectives</h3>
              {statusHistory.filter((s) => s.perspectives).slice(-1)[0].perspectives && (
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Perspective One</CardTitle>
                      {/* <CardDescription>Card Description</CardDescription> */}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {
                          statusHistory.filter((s) => s.perspectives).slice(-1)[0].perspectives!
                            .perspective_one
                        }
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Perspective Two</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">
                        {
                          statusHistory.filter((s) => s.perspectives).slice(-1)[0].perspectives!
                            .perspective_two
                        }
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Replace the grid view with ResearchFlow */}
          <div className="border rounded-lg p-4">
            <ResearchFlow handleResearch={handleResearch} statusHistory={statusHistory} />
          </div>
        </div>
      )}

      {summary && !isLoading && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Research Summary</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                {(() => {
                  const trackOneMatch = summary.match(
                    /### Track One\n([\s\S]*?)(?=\n### Track One Sources:)/
                  );
                  const trackTwoMatch = summary.match(
                    /### Track Two\n([\s\S]*?)(?=\n### Track Two Sources:)/
                  );
                  const trackOneSourcesMatch = summary.match(
                    /### Track One Sources:\n([\s\S]*?)(?=\n### Track Two)/
                  );
                  const trackTwoSourcesMatch = summary.match(/### Track Two Sources:\n([\s\S]*?)$/);

                  return (
                    <>
                      {/* Extract and format track one content */}
                      <h3 className="mb-4">Research Agent 1</h3>
                      {trackOneMatch && <ReactMarkdown>{trackOneMatch[1]}</ReactMarkdown>}

                      <div className="mb-4" />
                      {/* Parse and display track one sources */}
                      {trackOneSourcesMatch && (
                        <SourceList
                          title="Sources"
                          sources={parseSourcesFromText(trackOneSourcesMatch[1])}
                        />
                      )}
                      <div className="mb-8" />
                      {/* Extract and format track two content */}
                      <h3 className="mb-4">Research Agent 2</h3>
                      {trackTwoMatch && <ReactMarkdown>{trackTwoMatch[1]}</ReactMarkdown>}
                      <div className="mb-4" />
                      {/* Parse and display track two sources */}
                      {trackTwoSourcesMatch && (
                        <SourceList
                          title="Sources"
                          sources={parseSourcesFromText(trackTwoSourcesMatch[1])}
                        />
                      )}
                      <div className="mb-4" />
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={handleCreatePodcast}
            size="lg"
            className="w-full bg-green-600 hover:bg-green-700 font-mono"
          >
            Create Podcast from Summary
          </Button>
        </div>
      )}
    </div>
  );
}
