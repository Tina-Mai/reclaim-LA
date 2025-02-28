import React, { useMemo, useState, useRef } from "react";
import { ReactFlow, Node, Edge, Background, Controls, MiniMap } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ResearchInputNode } from "./ResearchInputNode";

interface StatusMessage {
  phase: string;
  message: string;
  timestamp: number;
  chain_of_thought?: { content: string };
  track?: string;
  perspectives?: {
    perspective_one: string;
    perspective_two: string;
    topic: string;
  };
}

interface ResearchFlowProps {
  statusHistory: StatusMessage[];
  handleResearch: (topic: string) => void;
}

const nodeTypes = {
  researchInput: ResearchInputNode,
};

export function ResearchFlow({ statusHistory, handleResearch }: ResearchFlowProps) {
  const [researchTopic, setResearchTopic] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const trackOneX = 100;
    const trackTwoX = 800;
    let lastTrackOneId = "";
    let lastTrackTwoId = "";

    // Track the Y positions
    let trackOneY = 200;
    let trackTwoY = 200;

    // Create a temporary div to measure content height
    const measureDiv = document.createElement("div");
    measureDiv.style.width = "500px"; // Same as node width
    measureDiv.style.position = "absolute";
    measureDiv.style.visibility = "hidden";
    measureDiv.style.padding = "10px";
    document.body.appendChild(measureDiv);

    const measureContent = (content: string) => {
      measureDiv.innerHTML = content;
      const height = measureDiv.offsetHeight;
      return height;
    };

    // First, separate statuses by track
    const trackOneStatuses: StatusMessage[] = [];
    const trackTwoStatuses: StatusMessage[] = [];
    const trackNullStatuses: StatusMessage[] = [];

    statusHistory.slice(1).forEach((status) => {
      if (status.track === "two") {
        trackTwoStatuses.push(status);
      } else if (status.track === "one") {
        trackOneStatuses.push(status);
      } else {
        trackNullStatuses.push(status);
      }
    });

    // Function to group adjacent statuses with same phase
    const groupStatuses = (statuses: StatusMessage[]): StatusMessage[][] => {
      const grouped: StatusMessage[][] = [];
      let currentGroup: StatusMessage[] = [];

      statuses.forEach((status, index) => {
        if (index === 0 || status.phase === statuses[index - 1].phase) {
          currentGroup.push(status);
        } else {
          if (currentGroup.length > 0) {
            grouped.push([...currentGroup]);
          }
          currentGroup = [status];
        }
      });
      if (currentGroup.length > 0) {
        grouped.push(currentGroup);
      }
      return grouped;
    };

    // Group each track's statuses
    const groupedTrackOne = groupStatuses(trackOneStatuses);
    const groupedTrackTwo = groupStatuses(trackTwoStatuses);
    const groupedTrackNull = groupStatuses(trackNullStatuses);

    console.log("groupedTrackNull", groupedTrackNull);

    // Create perspective node if it exists
    const firstStatus = statusHistory[0];
    if (firstStatus?.perspectives) {
      const id = "node-perspective";
      const width = 600;
      const perspectivesNode: Node = {
        id,
        type: "default",
        position: { x: 200, y: 50 },
        data: {
          label: (
            <div style={{ maxWidth: `${width}px` }}>
              <div className="font-semibold text-sm border-b rounded-t-lg border-gray-300 pt-2 pb-2 font-mono">
                Research Perspectives
              </div>
              <div className="text-xs py-2 bg-white/40 rounded-b-lg font-sans">
                {firstStatus.perspectives.topic}
              </div>
            </div>
          ),
        },
        style: {
          //   background: "#EFF6FF",
          //   padding: "10px 0",
          padding: 0,
          borderRadius: "10px",
          background: "transparent",
          border: "1px solid #e0e0e0",

          width: `${width}px`,
        },
      };
      nodes.push(perspectivesNode);
      lastTrackOneId = id;
      lastTrackTwoId = id;
    }

    // Function to create nodes for a track
    const createTrackNodes = (
      groupedStatuses: StatusMessage[][],
      isTrackTwo: boolean,
      startY: number
    ) => {
      let currentY = startY;

      groupedStatuses.forEach((group, index) => {
        const id = `node-${isTrackTwo ? "two" : "one"}-${index}-${crypto.randomUUID()}`;
        const status = group[0];
        const width = status.phase === "summary" || status.phase === "query" ? 600 : 300;
        const x = isTrackTwo ? trackTwoX : trackOneX;

        // Combine messages from the group
        const combinedMessage = group.map((s) => s.message).join("\n\n");
        const combinedThoughts = group
          .filter((s) => s.chain_of_thought?.content)
          .map((s) => s.chain_of_thought!.content)
          .join("\n\n");

        // Measure combined content height
        let contentHeight = measureContent(
          `<div class="font-semibold text-sm">${status.phase}</div>`
        );
        contentHeight += measureContent(
          `<div class="text-xs whitespace-pre-wrap">${combinedMessage}</div>`
        );
        if (combinedThoughts) {
          contentHeight += measureContent(
            `<div class="text-xs mt-2 whitespace-pre-wrap">${combinedThoughts}</div>`
          );
        }

        const node: Node = {
          id,
          type: "default",
          position: { x: x - width / 2, y: currentY },
          data: {
            label: (
              <div style={{ maxWidth: `${width}px` }}>
                <div className="font-semibold text-sm border-b border-gray-300 pb-2 font-mono pt-2">
                  {status.phase}
                </div>
                <div className="text-xs whitespace-pre-wrap pt-2 px-4 pb-2 font-sans bg-white/40">
                  {combinedMessage}
                </div>
                {combinedThoughts && (
                  <div className="text-xs px-4 whitespace-pre-wrap text-left font-sans bg-white/40 py-4">
                    {combinedThoughts}
                  </div>
                )}
              </div>
            ),
          },
          style: {
            padding: "0",
            borderRadius: "10px",
            border: "1px solid #e0e0e0",
            background:
              status.phase === "error"
                ? "#FEE2E280"
                : status.phase === "complete"
                ? "#D1FAE580"
                : status.phase === "summary"
                ? "#FED7AA80"
                : status.phase === "query"
                ? "#DDD6FE80"
                : "#EFF6FF80",
            width: `${width}px`,
          },
        };

        nodes.push(node);

        // Add edges
        const lastId = isTrackTwo ? lastTrackTwoId : lastTrackOneId;
        if (lastId) {
          // For complete nodes, connect to both tracks
          if (status.phase === "final") {
          } else {
            // Normal case - connect to previous node in same track
            edges.push({
              id: `edge-${lastId}-${id}`,
              source: lastId,
              target: id,

              animated: true,
            });
          }
        }

        // Update last node id for this track
        if (isTrackTwo) {
          console.log("lastTrackTwoId", id);
          lastTrackTwoId = id;
        } else {
          lastTrackOneId = id;
        }

        // Update Y position for next node
        currentY += contentHeight + 30; // 40px spacing between nodes
      });

      return currentY;
    };

    // Create nodes for both tracks
    trackOneY = createTrackNodes(groupedTrackOne, false, trackOneY);
    trackTwoY = createTrackNodes(groupedTrackTwo, true, trackTwoY);

    let y = Math.max(trackOneY, trackTwoY);
    let completeNodeId;
    groupedTrackNull.forEach((group, index) => {
      const id = `node-${group[0].phase}-${index}-${crypto.randomUUID()}`;

      const width = group[0].phase === "complete" ? 1000 : 300;

      const combinedMessage = group
        .map((s) => s.message)
        .join("\n\n")
        .split("\n")
        .filter(
          (line) =>
            !line.trim().toLowerCase().startsWith("###") &&
            !line.trim().toLowerCase().startsWith("- perplexity search")
        )
        .join("\n");
      const combinedThoughts = group
        .filter((s) => s.chain_of_thought?.content)
        .map((s) => s.chain_of_thought!.content)
        .join("\n\n");

      const node: Node = {
        id,
        type: "default",
        position: { x: 400 - width / 2, y },
        data: {
          label: (
            <div style={{ maxWidth: `${width}px` }}>
              <div className="font-semibold text-sm border-b border-gray-300 pb-2 font-mono">
                {group[0].phase}
              </div>
              <div className="text-xs whitespace-pre-wrap pt-2 px-4 pb-2 font-sans bg-white/40 text-left">
                {combinedMessage}
              </div>
              {combinedThoughts && (
                <div className="text-xs mt-2 px-4 whitespace-pre-wrap text-left font-sans">
                  {combinedThoughts}
                </div>
              )}
              {group[0].phase === "complete" && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs whitespace-pre-wrap pt-4 px-4 font-sans bg-white/40 flex gap-2 ">
                    <Input
                      className="no-drag mb-2"
                      type="text"
                      //   value={data.value}
                      //   onChange={(e) => data.onChange(e.target.value)}
                      placeholder="Steer topic..."
                      ref={inputRef}
                    />
                    <Button
                      onClick={() =>
                        handleResearch(
                          statusHistory[0].perspectives?.topic + " " + inputRef.current?.value
                        )
                      }
                    >
                      Research
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ),
        },
        style: {
          padding: "10px 0",
          borderRadius: "10px",
          border: "1px solid #e0e0e0",
          background:
            group[0].phase === "error"
              ? "#FEE2E280"
              : group[0].phase === "complete"
              ? "#D1FAE580"
              : group[0].phase === "summary"
              ? "#FDE68A80"
              : group[0].phase === "research"
              ? "#BFDBFE80"
              : group[0].phase === "loop"
              ? "#DDD6FE80"
              : group[0].phase === "query"
              ? "#A7F3D080"
              : group[0].phase === "reflection"
              ? "#FED7AA80"
              : "#EFF6FF80",
          width: `${width}px`,
        },
      };

      nodes.push(node);

      //   let contentHeight = measureContent(
      //     `<div class="font-semibold text-sm">${group[0].phase}</div>`
      //   );
      const contentHeight = measureContent(
        `<div class="text-xs whitespace-pre-wrap">${combinedMessage}</div>`
      );
      console.log("contentHeight", contentHeight);
      y += contentHeight + 50;

      console.log("final node", id);
      console.log("lastTrackOneId", lastTrackOneId);
      console.log("lastTrackTwoId", lastTrackTwoId);
      if (group[0].phase === "final") {
        if (lastTrackOneId && lastTrackOneId !== id) {
          edges.push({
            id: `edge-${lastTrackOneId}-${id}`,
            source: lastTrackOneId,
            target: id,
            type: "",
            animated: true,
          });
        }
        if (group[0].message == "Starting final summary compilation...") {
          if (lastTrackTwoId && lastTrackTwoId !== id) {
            edges.push({
              id: `edge-${lastTrackTwoId}-${id}`,
              source: lastTrackTwoId,
              target: id,
              type: "",
              animated: true,
            });
          }
        }
        lastTrackOneId = id;
        lastTrackTwoId = id;
      } else if (group[0].phase == "complete") {
        completeNodeId = id;
        if (lastTrackOneId && lastTrackOneId !== id) {
          edges.push({
            id: `edge-${lastTrackOneId}-${id}`,
            source: lastTrackOneId,
            target: id,
            type: "",
            animated: true,
          });
        }
      }
    });

    // Clean up the measurement div
    document.body.removeChild(measureDiv);

    return { nodes, edges };
  }, [statusHistory]);

  return (
    <div style={{ height: "90vh", minHeight: "600px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.1,
          maxZoom: 1.5,
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
