"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { ChatMessage, ChatResponseBody } from "@/lib/types";

async function sendChat(messages: ChatMessage[]): Promise<ChatResponseBody> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map(({ role, content }) => ({ role, content })),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || "Gagal menghubungi server");
  }
  return data as ChatResponseBody;
}

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      role: "assistant",
      content: "Halo! Saya chatbot yang terhubung ke OpenRouter. Tanyakan apa saja.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = useMutation({
    mutationFn: sendChat,
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: data.reply },
      ]);
      queueScroll();
    },
    onError: (err: Error) => {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: `⚠️ Error: ${err.message}`,
        },
      ]);
      queueScroll();
    },
  });

  function queueScroll() {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMsg: ChatMessage = { id: makeId(), role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput("");
    queueScroll();
    chatMutation.mutate(nextMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-2xl mx-auto rounded-2xl border border-border bg-panel shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-background/60">
        <h1 className="text-sm font-semibold text-white">
          Custom AI Chatbox · OpenRouter
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-bubbleUser text-white rounded-br-sm"
                  : "bg-bubbleBot text-gray-100 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-bubbleBot text-gray-400 text-sm rounded-2xl rounded-bl-sm px-4 py-2 animate-pulse">
              Mengetik...
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-3 flex gap-2 items-end bg-background/60">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Tulis pesan... (Enter untuk kirim, Shift+Enter baris baru)"
          className="flex-1 resize-none rounded-xl bg-panel border border-border text-sm text-white px-3 py-2 outline-none focus:border-bubbleUser"
        />
        <button
          onClick={handleSend}
          disabled={chatMutation.isPending || !input.trim()}
          className="rounded-xl bg-bubbleUser disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm px-4 py-2 font-medium hover:opacity-90 transition"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
