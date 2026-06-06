"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Circle,
  Box
} from "lucide-react";

import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const { name } = useUser();
  const firstName = name.split(" ")[0] || "There";

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setInput("");
    // Handle submission logic
  };

  return (
    <div className="flex-1 h-full relative p-6 md:p-12 flex flex-col overflow-hidden">

      {/* Top Right Logo */}


      <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full animate-fade-in-up">

        {/* Header */}
        <div className="mb-12 w-full text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-blue-500 mb-4 flex items-center justify-center gap-3">
            Welcome, {firstName}! <span className="animate-wave inline-block origin-bottom-right">👋</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-medium tracking-tight text-slate-400">
            How can I help you today?
          </h2>
        </div>

        {/* Chat Input Centered */}
        <div className="w-full relative z-50 flex justify-center">
          <form
            onSubmit={handleSend}
            className="w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 rounded-full p-2 flex items-center transition-all focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-within:border-blue-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
          >
            <div className="relative flex-shrink-0">
              {/* Upload Menu Popover anchored to star button */}
              {showUploadMenu && (
                <div className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-64 animate-fade-in-up z-50 origin-bottom-left">
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setShowUploadMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full">
                      <FileText size={16} className="text-blue-500" />
                      Upload Document
                    </button>
                    <button onClick={() => setShowUploadMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full">
                      <Box size={16} className="text-emerald-500" />
                      Upload Image
                    </button>
                    <button onClick={() => setShowUploadMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full">
                      <Circle size={16} className="text-yellow-500" />
                      Google Drive
                    </button>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="p-3 text-purple-500 hover:bg-purple-50 rounded-full transition-colors"
                title="Upload Files"
              >
                <Sparkles size={20} />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask or search for anything. Use @ to tag a file or collection."
              className="flex-1 bg-transparent border-none outline-none px-2 text-slate-700 placeholder:text-slate-400 text-base"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 disabled:hover:text-slate-400 flex-shrink-0 mx-1"
            >
              <ArrowRight size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
