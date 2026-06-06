"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, ArrowRight, FileText, Circle, Box, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useApp } from "@/context/AppContext";

const MODE_CONFIG = {
  general: { icon: "🧠", label: "General" },
  web_search: { icon: "🌐", label: "Web Search" },
  rag: { icon: "📄", label: "Document" },
};

export default function DashboardPage() {
  const [input, setInput] = useState("");
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [uploadMsg, setUploadMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const { name } = useUser();
  const { messages, isLoading, sendMessage, uploadDoc, currentDocName, clearDoc } = useApp();
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firstName = name.split(" ")[0] || "There";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent | null, override?: string) => {
    e?.preventDefault();
    const text = override ?? input;
    if (!text.trim() || isLoading) return;
    setInput("");
    await sendMessage(text);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg("");
    setShowUploadMenu(false);
    try {
      const result = await uploadDoc(file);
      setUploadMsg(`Indexed ${result.chunk_count} chunks from "${file.name}"`);
    } catch {
      setUploadMsg("Upload failed — try again");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          /* Welcome screen */
          <div className="flex flex-col items-center justify-center h-full px-6">
            {currentDocName && (
              <div className="mb-6 flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-full border border-orange-100">
                <FileText size={14} />
                <span className="max-w-xs truncate">RAG mode: {currentDocName}</span>
                <button onClick={clearDoc} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">✕</button>
              </div>
            )}

            <div className="mb-10 text-center animate-fade-in-up">
              <div className="inline-flex items-center justify-center gap-4 mb-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight welcome-gradient">
                  Welcome, {firstName}!
                </h1>
                <span className="text-5xl md:text-6xl animate-wave inline-block origin-bottom-right">👋</span>
              </div>
              <p className="text-xl md:text-2xl font-medium text-slate-400">
                What can I help you with today?
              </p>
            </div>

            <div className="w-full max-w-2xl relative z-10">
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
              <form
                onSubmit={handleSend}
                className="w-full bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-slate-200/60 rounded-full p-2.5 flex items-center transition-all focus-within:shadow-[0_8px_40px_rgba(59,130,246,0.15)] focus-within:border-blue-300"
              >
                <div className="relative flex-shrink-0">
                  {showUploadMenu && (
                    <div className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-60 z-50 animate-fade-in-up">
                      <div className="flex flex-col gap-1">
                        <button type="button" disabled={uploading} onClick={() => { setShowUploadMenu(false); fileInputRef.current?.click(); }}
                          className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full disabled:opacity-50">
                          <FileText size={15} className="text-blue-500" />{uploading ? "Uploading…" : "Upload PDF (RAG)"}
                        </button>
                        <button type="button" onClick={() => setShowUploadMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full">
                          <Box size={15} className="text-emerald-500" />Upload Image
                        </button>
                        <button type="button" onClick={() => setShowUploadMenu(false)} className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full">
                          <Circle size={15} className="text-yellow-500" />Google Drive
                        </button>
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => setShowUploadMenu(!showUploadMenu)} className="p-3 text-violet-500 hover:bg-violet-50 rounded-full transition-colors">
                    <Sparkles size={20} />
                  </button>
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(null); } }}
                  disabled={isLoading}
                  placeholder="Ask me anything or @tag a file…"
                  className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder:text-slate-400 text-lg disabled:opacity-50"
                />
                <button type="submit" disabled={!input.trim() || isLoading}
                  className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-40 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 flex-shrink-0 mx-1 shadow-md shadow-blue-500/20">
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} strokeWidth={2.5} />}
                </button>
              </form>
              {uploadMsg && (
                <div className="mt-3 text-sm text-slate-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center justify-between">
                  ✅ {uploadMsg}
                  <button onClick={() => setUploadMsg("")} className="text-slate-400 hover:text-slate-600 ml-3">✕</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Chat view */
          <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-4">
            {currentDocName && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-xl border border-orange-100 w-fit">
                <FileText size={14} />
                <span>RAG: {currentDocName}</span>
                <button onClick={clearDoc} className="ml-1 text-slate-400 hover:text-red-500 transition-colors">✕</button>
              </div>
            )}
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const mode = msg.mode ? MODE_CONFIG[msg.mode] : null;
              return (
                <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${isUser ? "bg-blue-100" : "bg-gradient-to-br from-blue-600 to-violet-600"}`}>
                    {isUser ? "👤" : "🤖"}
                  </div>
                  <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${isUser ? "bg-gradient-to-br from-blue-600 to-violet-600 text-white rounded-tr-sm" : "bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-sm"}`}>
                    {msg.content}
                    {mode && !isUser && <span className="mt-2 block text-xs font-semibold opacity-50">{mode.icon} {mode.label}</span>}
                    {msg.sources && msg.sources.length > 0 && <div className="mt-2 text-xs opacity-50">Sources: {msg.sources.join(", ")}</div>}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm flex-shrink-0">🤖</div>
                <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-slate-50 border border-slate-100">
                  <Loader2 size={16} className="animate-spin text-blue-500" />
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Bottom input bar (chat mode only) */}
      {!showWelcome && (
        <div className="flex-shrink-0 px-4 py-4 bg-white border-t border-slate-100">
          <div className="max-w-3xl mx-auto">
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            <form onSubmit={handleSend}
              className="w-full bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.08)] border border-slate-200/60 rounded-full p-2.5 flex items-center transition-all focus-within:border-blue-300">
              <div className="relative flex-shrink-0">
                {showUploadMenu && (
                  <div className="absolute bottom-full left-0 mb-4 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 w-60 z-50">
                    <button type="button" disabled={uploading} onClick={() => { setShowUploadMenu(false); fileInputRef.current?.click(); }}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors w-full disabled:opacity-50">
                      <FileText size={15} className="text-blue-500" />{uploading ? "Uploading…" : "Upload PDF (RAG)"}
                    </button>
                  </div>
                )}
                <button type="button" onClick={() => setShowUploadMenu(!showUploadMenu)} className="p-3 text-violet-500 hover:bg-violet-50 rounded-full transition-colors">
                  <Sparkles size={20} />
                </button>
              </div>
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(null); } }}
                disabled={isLoading}
                placeholder={currentDocName ? `Ask about "${currentDocName}"…` : "Ask me anything or @tag a file…"}
                className="flex-1 bg-transparent border-none outline-none px-4 text-slate-700 placeholder:text-slate-400 text-base disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || isLoading}
                className="w-12 h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-full hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-40 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 flex-shrink-0 mx-1 shadow-md shadow-blue-500/20">
                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={20} strokeWidth={2.5} />}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
