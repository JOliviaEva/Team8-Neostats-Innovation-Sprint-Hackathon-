"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark" | "system";

interface UserContextType {
  name: string;
  email: string;
  avatar: string;
  theme: Theme;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setTheme: (theme: Theme) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState("Sam Smith");
  const [email, setEmailState] = useState("sam@example.com");
  const [avatar, setAvatarState] = useState("https://i.pravatar.cc/150?img=11");
  const [theme, setThemeState] = useState<Theme>("system");

  // Load from local storage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedAvatar = localStorage.getItem("userAvatar");
    const storedTheme = localStorage.getItem("theme") as Theme;
    if (storedName) setNameState(storedName);
    if (storedEmail) setEmailState(storedEmail);
    if (storedAvatar) setAvatarState(storedAvatar);
    if (storedTheme) setThemeState(storedTheme);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const setName = (newName: string) => {
    setNameState(newName);
    localStorage.setItem("userName", newName);
  };

  const setEmail = (newEmail: string) => {
    setEmailState(newEmail);
    localStorage.setItem("userEmail", newEmail);
  };

  const setAvatar = (newAvatar: string) => {
    setAvatarState(newAvatar);
    localStorage.setItem("userAvatar", newAvatar);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <UserContext.Provider value={{ name, email, avatar, theme, setName, setEmail, setAvatar, setTheme }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
