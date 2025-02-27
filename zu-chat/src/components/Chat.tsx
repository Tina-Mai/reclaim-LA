'use client';

import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: string;
  content: string;
}

interface ChatProps {
  messages: Message[];
  isLoading?: boolean;
}

export function Chat({ messages, isLoading }: ChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="rounded-lg border bg-background p-4 space-y-4 overflow-y-auto max-h-[600px]">
      {messages.map((message, index) => (
        <div
          key={index}
          className={`flex flex-col ${
            message.role === "assistant" ? "items-start" : "items-end"
          }`}
        >
          <div
            className={`rounded-lg px-4 py-2 max-w-[85%] ${
              message.role === "assistant"
                ? "bg-muted"
                : "bg-primary text-primary-foreground"
            }`}
          >
            <ReactMarkdown className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce"></div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
} 