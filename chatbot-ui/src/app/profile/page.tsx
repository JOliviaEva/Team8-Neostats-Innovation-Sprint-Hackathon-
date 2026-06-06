"use client";

import React, { useState } from "react";
import { useUser } from "@/context/UserContext";
import { Save, User, Mail, Image as ImageIcon } from "lucide-react";

export default function ProfilePage() {
  const { name, email, avatar, theme, setName, setEmail, setAvatar, setTheme } = useUser();

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
    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-purple-50 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950 transition-colors">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 tracking-tight">Account Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your account details and application preferences.</p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 border border-white dark:border-slate-800 shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-none">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Personal Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Display Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-medium placeholder:font-normal"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-medium placeholder:font-normal"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Application Preferences */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Application Preferences</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Theme Preference</label>
                  <select 
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as "light" | "dark" | "system")}
                    className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-medium appearance-none"
                  >
                    <option value="light">Light Mode (Default)</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                  <select className="w-full px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 dark:focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-medium appearance-none">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-8 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-2 transition-all duration-300" style={{ opacity: saved ? 1 : 0, transform: saved ? 'translateY(0)' : 'translateY(10px)' }}>
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
