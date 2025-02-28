import React, { useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface ResearchInputNodeProps {
  data: {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
  };
}

export function ResearchInputNode({ data }: ResearchInputNodeProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-white border-2 border-gray-200">
      <Handle type="target" position={Position.Top} />
      <div className="font-semibold text-sm border-b border-gray-300 pb-2 font-mono pt-2">
        Continue steering
      </div>
      <div className="text-xs whitespace-pre-wrap pt-2 pb-2 font-sans bg-white/40">
        <Input
          className="no-drag mb-2"
          type="text"
          //   value={data.value}
          //   onChange={(e) => data.onChange(e.target.value)}
          placeholder="Steer topic..."
          ref={inputRef}
        />
        <Button onClick={() => data.onSubmit(inputRef.current?.value || "")} className="w-full">
          Research
        </Button>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
