"use client";

import AgentMessage from "@/components/agent-message";
import Navbar from "@/components/navbar";
import PromptBar from "@/components/prompt-bar";
import UserMessage from "@/components/user-message";
import { Typography, Button } from "@mui/material";
import EastRoundedIcon from "@mui/icons-material/EastRounded";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdvisorApiResponse } from "@/lib/advisor/types";

interface Message {
  type: "agent" | "user";
  text: string;
}

export default function RiskProfilePage() {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const conversationEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isComplete) {
      router.push("/allocation");
    }
  }, [isComplete, router]);

  useEffect(() => {
    const startConversation = async () => {
      try {
        const response = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        if (!response.ok) throw new Error("API Error");

        const data: AdvisorApiResponse = await response.json();
        if (!data.isComplete) {
          setMessages([{ type: "agent", text: data.question }]);
          setSessionId(data.sessionId);
        }
      } catch (error) {
        setMessages([
          {
            type: "agent",
            text: "Sorry, I'm having trouble connecting. Please try refreshing the page.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    startConversation();
  }, []);

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    setMessages((prev) => [...prev, { type: "user", text: messageText }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponse: messageText, sessionId }),
      });
      if (!response.ok) throw new Error("API Error");

      const data: AdvisorApiResponse = await response.json();

      if (data.isComplete) {
        const { allocation } = data;
        const finalMessages: Message[] = [
          {
            type: "agent",
            text: `Great! Based on our conversation, you have a **${allocation.risk_profile}** profile. Here is your recommended allocation:`,
          },
          {
            type: "agent",
            text: allocation.allocations
              .map((a) => `- **${a.category.toUpperCase()}**: ${a.percentage}%`)
              .join("\n"),
          },
          {
            type: "agent",
            text: `**Reasoning:** ${allocation.reasoning}`,
          },
        ];
        setMessages((prev) => [...prev, ...finalMessages]);

        const orderedAllocation = ["spot", "vault", "lending", "lp"].map(
          (cat) =>
            allocation.allocations.find((a) => a.category === cat) || {
              category: cat,
              percentage: 0,
            }
        );
        console.log("ALLOCATION:", orderedAllocation);
        setIsComplete(true);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "agent", text: data.question },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          type: "agent",
          text: "Sorry, an error occurred. Please try sending your message again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
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
            {messages.map((msg, index) => {
              if (msg.type === "agent") {
                return <AgentMessage key={index} message={msg.text} />;
              } else {
                return (
                  <div key={index} className="flex justify-end">
                    <UserMessage message={msg.text} />
                  </div>
                );
              }
            })}
            {isLoading && <AgentMessage message="..." />}
            <div ref={conversationEndRef} />
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
