"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Home,
  MessageSquarePlus,
  CheckSquare,
  Video,
  FileText,
  Share2,
  Settings,
  ChevronsLeft,
  Menu,
  MoreHorizontal
} from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const { name, avatar } = useUser();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile hamburger - only shows when sidebar is hidden on small screens */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md text-slate-600"
        >
          <Menu size={20} />
        </button>
      )}

      <div
        className={`flex flex-col h-full bg-white border-r border-slate-100 transition-all duration-300 ease-in-out absolute md:relative z-40 ${isOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Logo */}
          <div className="flex items-center justify-start p-4 mb-2 min-h-[80px]">
            {isOpen ? (
              <div className="w-48 h-16 flex-shrink-0">
                <img src="/assest/logo3.png" alt="NeoPulse" className="w-full h-full object-contain object-left mix-blend-multiply" />
              </div>
            ) : (
              <button 
                onClick={() => setIsOpen(true)}
                className="w-10 h-10 flex-shrink-0 mx-auto relative group outline-none"
                title="Expand Sidebar"
              >
                <img src="/assest/logo3.png" alt="NeoPulse" className="w-full h-full object-cover rounded-xl shadow-sm group-hover:opacity-20 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Menu size={18} className="text-blue-600" />
                </div>
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <div className="px-3 flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-xl text-slate-900 font-medium group">
              <Home size={18} className="text-slate-700" />
              {isOpen && <span className="text-sm">Home</span>}
            </Link>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
              <MessageSquarePlus size={18} />
              {isOpen && <span className="text-sm">New Chat</span>}
            </Link>
            <Link href="/tasks" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
              <CheckSquare size={18} />
              {isOpen && <span className="text-sm">My Tasks</span>}
            </Link>
            <Link href="/meetings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
              <Video size={18} />
              {isOpen && <span className="text-sm">My Meetings</span>}
            </Link>
            <Link href="/files" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
              <FileText size={18} />
              {isOpen && <span className="text-sm">Saved Files</span>}
            </Link>
            <Link href="/shared" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors w-full text-left">
              <Share2 size={18} />
              {isOpen && <span className="text-sm">Shared with me</span>}
            </Link>
          </div>

          {/* History Sections */}
          {isOpen && (
            <div className="flex-1 overflow-y-auto px-4 mt-6">
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-2">Today</p>
                <div className="flex flex-col gap-3">
                  <button className="text-left text-sm text-slate-600 hover:text-blue-600 truncate transition-colors">
                    Research Assistance Request
                  </button>
                  <button className="text-left text-sm text-slate-600 hover:text-blue-600 truncate transition-colors">
                    Summarizing Last Meeting
                  </button>
                  <button className="text-left text-sm text-slate-600 hover:text-blue-600 truncate transition-colors">
                    Prioritizing Tasks Request
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-2">Yesterday</p>
                <div className="flex flex-col gap-3">
                  <button className="text-left text-sm text-slate-600 hover:text-blue-600 truncate transition-colors">
                    Document Summary Request
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Widgets */}
          <div className="p-4 flex flex-col gap-2 mt-auto">
            
            {/* User Profile Area */}
            <div className={`flex items-center gap-3 py-3 mb-2 rounded-2xl border border-slate-100 shadow-sm bg-gradient-to-tr from-slate-50 to-white transition-all ${isOpen ? 'px-4 mx-1' : 'justify-center mx-0 px-0'}`}>
              {isOpen ? (
                <div className="flex flex-col w-full">
                  <span className="font-semibold text-sm text-slate-800">Admin</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Free Plan</span>
                </div>
              ) : (
                <span className="font-bold text-sm text-slate-800">A</span>
              )}
            </div>

            <Link href="/profile" className={`flex items-center text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-xl py-2 ${isOpen ? 'px-4 justify-between' : 'justify-center'}`}>
              <div className="flex items-center gap-3">
                <Settings size={18} />
                {isOpen && <span className="text-sm font-medium">Settings</span>}
              </div>
              {isOpen && <MoreHorizontal size={16} className="text-slate-400" />}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
