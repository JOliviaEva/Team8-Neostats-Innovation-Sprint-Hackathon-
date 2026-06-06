"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Save, User, Mail, Image as ImageIcon } from "lucide-react";

export default function ProfilePage() {
  const { name, email, avatar, setName, setEmail, setAvatar } = useUser();

  const [formData, setFormData] = useState({ name, email, avatar });
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Profile Settings</h1>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-blue-100 border-4 border-white shadow-md flex-shrink-0">
              <img src={formData.avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">{formData.name}</h2>
              <p className="text-slate-500">{formData.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Display Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700"
                  required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Avatar URL</label>
              <div className="relative">
                <ImageIcon size={18} className="absolute left-3 top-3 text-slate-400" />
                <input type="url" name="avatar" value={formData.avatar} onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-slate-700"
                  required />
              </div>
              <p className="text-xs text-slate-500 mt-2">Provide a direct link to an image to update your avatar.</p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-sm text-emerald-600 font-medium transition-opacity" style={{ opacity: saved ? 1 : 0 }}>
                Successfully saved!
              </span>
              <button type="submit"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow active:scale-95">
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
