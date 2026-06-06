"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  name: string;
  email: string;
  avatar: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [name, setNameState] = useState("Sam Smith");
  const [email, setEmailState] = useState("sam@example.com");
  const [avatar, setAvatarState] = useState("https://i.pravatar.cc/150?img=11");

  // Load from local storage on mount
  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    const storedAvatar = localStorage.getItem("userAvatar");
    if (storedName) setNameState(storedName);
    if (storedEmail) setEmailState(storedEmail);
    if (storedAvatar) setAvatarState(storedAvatar);
  }, []);

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

  return (
    <UserContext.Provider value={{ name, email, avatar, setName, setEmail, setAvatar }}>
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
