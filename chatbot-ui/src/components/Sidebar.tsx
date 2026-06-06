"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  MessageSquarePlus,
  CheckSquare,
  Video,
  FileText,
  Share2,
  ChevronsLeft,
  Menu,
  Trash2,
  LogOut,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import type { Session } from "@/lib/api";

function groupSessionsByDate(sessions: Session[]) {
  const today: Session[] = [];
  const yesterday: Session[] = [];
  const older: Session[] = [];
  const now = new Date();
  const todayStr = now.toDateString();
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yestStr = yest.toDateString();

  for (const s of sessions) {
    if (!s.updated_at) { today.push(s); continue; }
    const d = new Date(s.updated_at).toDateString();
    if (d === todayStr) today.push(s);
    else if (d === yestStr) yesterday.push(s);
    else older.push(s);
  }
  return { today, yesterday, older };
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const { auth, sessions, sessionId, newChat, switchSession, deleteSession, login, logout } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await login(loginUser, loginPass);
      setShowLoginForm(false);
      setLoginUser("");
      setLoginPass("");
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const { today, yesterday, older } = groupSessionsByDate(sessions);

  const renderSession = (s: Session) => (
    <div key={s.session_id} className="flex items-center gap-1 group">
      <button
        onClick={() => switchSession(s.session_id)}
        className={`flex-1 text-left text-sm truncate py-1 px-1 rounded-lg transition-colors ${
          s.session_id === sessionId ? "text-blue-600 font-medium" : "text-slate-600 hover:text-blue-600"
        }`}
      >
        {s.doc_name ? "📄 " : ""}{s.title || "New Chat"}
      </button>
      <button onClick={() => deleteSession(s.session_id)}
        className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all flex-shrink-0">
        <Trash2 size={11} />
      </button>
    </div>
  );

  return (
    <>
      {!isOpen && (
        <button onClick={() => setIsOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600">
          <Menu size={20} />
        </button>
      )}

      <div className={`flex flex-col h-full bg-white border-r border-slate-100 transition-all duration-300 ease-in-out absolute md:relative z-40 ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"}`}>

        {/* Logo + collapse */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 min-h-[72px]">
          {isOpen && (
            <Image src="/cu-logo.png" alt="Christ University" width={130} height={52} className="object-contain object-left max-h-14" priority />
          )}
          <button onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-slate-600 transition-colors ml-auto flex-shrink-0">
            {isOpen ? <ChevronsLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-3 flex flex-col gap-0.5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl text-slate-900 font-semibold">
            <Home size={18} className="text-slate-700 flex-shrink-0" />
            {isOpen && <span className="text-sm">Home</span>}
          </Link>
          <button onClick={newChat} className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
            <MessageSquarePlus size={18} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">New Chat</span>}
          </button>
          <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <CheckSquare size={18} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">My Tasks</span>}
          </Link>
          <Link href="/meetings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Video size={18} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">My Meetings</span>}
          </Link>
          <Link href="/files" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <FileText size={18} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">Saved Files</span>}
          </Link>
          <Link href="/shared" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
            <Share2 size={18} className="flex-shrink-0" />
            {isOpen && <span className="text-sm">Shared with me</span>}
          </Link>
        </nav>

        {/* Chat History */}
        {isOpen && (
          <div className="flex-1 overflow-y-auto px-4 min-h-0">
            {!auth.username && sessions.length === 0 && (
              <div className="mb-3">
                {!showLoginForm ? (
                  <button onClick={() => setShowLoginForm(true)} className="text-xs text-blue-500 hover:underline">
                    Login to save history
                  </button>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-2 mt-1">
                    <input type="text" placeholder="Username" value={loginUser} onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                    <input type="password" placeholder="Password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full text-xs px-2 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400" />
                    {loginError && <p className="text-xs text-red-500">{loginError}</p>}
                    <button type="submit" className="w-full text-xs bg-blue-600 text-white rounded-lg py-1.5 hover:bg-blue-700 transition-colors">Sign In</button>
                  </form>
                )}
              </div>
            )}

            {today.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2 mt-1">Today</p>
                <div className="flex flex-col gap-1">{today.map(renderSession)}</div>
              </div>
            )}
            {yesterday.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Yesterday</p>
                <div className="flex flex-col gap-1">{yesterday.map(renderSession)}</div>
              </div>
            )}
            {older.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Older</p>
                <div className="flex flex-col gap-1">{older.map(renderSession)}</div>
              </div>
            )}
          </div>
        )}

        {/* Auth strip */}
        {isOpen && auth.username && (
          <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between">
            <span className="text-sm text-slate-600 font-medium">👤 {auth.username}</span>
            <button onClick={logout} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
