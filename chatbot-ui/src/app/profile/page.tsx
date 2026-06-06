"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Save, User, Mail, Image as ImageIcon } from "lucide-react";

export default function ProfilePage() {
  const { name, email, avatar, setName, setEmail, setAvatar } = useUser();

  const [formData, setFormData] = useState({
    name: name,
    email: email,
    avatar: avatar
  });

  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setName(formData.name);
    setEmail(formData.email);
    setAvatar(formData.avatar);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/50">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 mt-2">Manage your account details and personalization.</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] p-8 border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          
          <div className="flex flex-col md:flex-row items-center gap-6 mb-10 pb-8 border-b border-slate-100">
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-tr from-blue-100 to-purple-100 p-1 shadow-md flex-shrink-0">
                <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover rounded-full border-4 border-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-slate-800">{formData.name}</h2>
              <p className="text-slate-500 mt-1">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium placeholder:font-normal"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Avatar URL</label>
              <div className="relative">
                <ImageIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="url"
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-800 font-medium placeholder:font-normal"
                  required
                />
              </div>
              <p className="text-sm text-slate-500 mt-2 ml-1">Provide a direct link to an image to update your avatar.</p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-sm text-emerald-600 font-semibold flex items-center gap-2 transition-all duration-300" style={{ opacity: saved ? 1 : 0, transform: saved ? 'translateY(0)' : 'translateY(10px)' }}>
                <Save size={16} /> Successfully saved!
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-3 rounded-2xl font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
