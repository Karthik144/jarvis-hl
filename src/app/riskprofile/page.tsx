"use client";

import AgentMessage from "@/components/agent-message";
import Navbar from "@/components/navbar";
import PromptBar from "@/components/prompt-bar";
import UserMessage from "@/components/user-message";
import { Typography } from "@mui/material";
import React from "react";

interface Message {
  type: "agent" | "user";
  text: string;
}

export default function RiskProfilePage() {
  const [messages, setMessages] = React.useState<Message[]>([
    { type: "agent", text: "What's your risk appititie?" },
  ]);

  const handleSendMessage = (messageText: string) => {
    const newUserMessage: Message = { type: "user", text: messageText };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);

    setTimeout(() => {
      const agentResponse: Message = {
        type: "agent",
        text: `Got it. You said: "${messageText}". What are your long term financial goals?`,
      };
      setMessages((prev) => [...prev, agentResponse]);
    }, 1000);

    console.log("User sent:", messageText);
  };

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      <main className="flex-grow p-8 overflow-y-auto">
        <div className="w-full max-w-4xl">
          <div className="flex flex-col gap-1 mb-8">
            <Typography variant="h6" fontWeight={550}>
              Let's first understand your goals and risk profile...
            </Typography>
            <Typography variant="body1">
              Feel free to ask me follow up questions -- here to help!
            </Typography>
          </div>

          <div className="space-y-6">
            {messages.map((msg, index) =>
              msg.type === "agent" ? (
                <AgentMessage key={index} message={msg.text} />
              ) : (
                <UserMessage key={index} message={msg.text} />
              )
            )}
          </div>
        </div>
      </main>

      <div className="flex-shrink-0 p-8 pt-4">
        <div className="w-full max-w-4xl mx-auto">
          <PromptBar onSubmit={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}
