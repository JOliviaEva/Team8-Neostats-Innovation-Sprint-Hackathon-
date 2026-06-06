"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Circle,
  Box,
  Image as ImageIcon,
  Folder,
  Plus
} from "lucide-react";

import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "agent"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { name } = useUser();
  const firstName = name.split(" ")[0] || "There";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      
      const data = await response.json();
      setMessages((prev) => [...prev, { role: "agent", content: data.answer }]);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages((prev) => [...prev, { role: "agent", content: "Sorry, I encountered an error communicating with the backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 h-full relative p-6 md:p-12 flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 transition-colors">

      {/* Top Right Logo */}


      <div className={`flex-1 flex flex-col min-h-0 mx-auto w-full max-w-4xl animate-fade-in-up ${messages.length === 0 ? "items-center justify-center" : "justify-between"}`}>

        {messages.length === 0 ? (
          <div className="mb-12 w-full text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Whats The Vibe, {firstName}!
              </h1>
              <span className="text-5xl md:text-6xl animate-wave inline-block origin-bottom-right">👋</span>
            </div>
            <h2 className="text-xl md:text-2xl font-medium tracking-tight text-slate-500 dark:text-slate-400">
              What can I help you with today?
            </h2>
          </div>
        ) : (
          <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto mb-8 pr-2 pb-4 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-base ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex w-full justify-start">
                <div className="max-w-[80%] p-4 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none flex gap-2 items-center">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Chat Input */}
        <div className={`w-full relative z-50 flex justify-center ${messages.length === 0 ? "mt-4" : "mt-auto"}`}>
          <form
            onSubmit={handleSend}
            className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-none border border-slate-200/60 dark:border-slate-700 rounded-full p-2.5 flex items-center transition-all focus-within:shadow-[0_8px_40px_rgb(59,130,246,0.15)] focus-within:border-blue-300 dark:focus-within:border-blue-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)]"
          >
            <div className="relative flex-shrink-0">
              {/* Upload Menu Popover anchored to star button */}
              {showUploadMenu && (
                <div className="absolute bottom-16 left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-2 z-50 w-48 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col">
                    <button type="button" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <ImageIcon size={16} className="text-blue-500" />
                      Upload Image
                    </button>
                    <button type="button" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <FileText size={16} className="text-green-500" />
                      Upload Document
                    </button>
                    <button type="button" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <Folder size={16} className="text-amber-500" />
                      Upload Folder
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="p-3 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                title="Upload Files"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything or @tag a file..."
              className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-lg"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:from-slate-200 dark:disabled:from-slate-700 disabled:to-slate-200 dark:disabled:to-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 flex-shrink-0 mx-1 shadow-md shadow-blue-500/20 dark:shadow-none"
            >
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
