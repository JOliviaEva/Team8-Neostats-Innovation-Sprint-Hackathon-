import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Message, Session } from '../types';
import { sessionAPI, chatAPI, documentAPI, authAPI } from '../api/api';

interface Auth {
  token: string | null;
  userId: number | null;
  username: string | null;
}

interface AppContextType {
  auth: Auth;
  sessionId: string;
  messages: Message[];
  sessions: Session[];
  currentDocId: string | null;
  currentDocName: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  newChat: () => void;
  switchSession: (sid: string) => Promise<void>;
  deleteSession: (sid: string) => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  uploadDoc: (file: File) => Promise<{ chunk_count: number }>;
  clearDoc: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<Auth>({ token: null, userId: null, username: null });
  const [sessionId, setSessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [currentDocName, setCurrentDocName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshSessions = useCallback(async (userId: number) => {
    try {
      const data = await sessionAPI.list(userId);
      setSessions(data);
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string) => {
      const data = await authAPI.login(username, password);
      setAuth({ token: data.token, userId: data.user_id, username: data.username });
      await refreshSessions(data.user_id);
    },
    [refreshSessions]
  );

  const logout = useCallback(() => {
    setAuth({ token: null, userId: null, username: null });
    setSessions([]);
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setCurrentDocId(null);
    setCurrentDocName(null);
  }, []);

  const newChat = useCallback(() => {
    setSessionId(crypto.randomUUID());
    setMessages([]);
    setCurrentDocId(null);
    setCurrentDocName(null);
  }, []);

  const switchSession = useCallback(async (sid: string) => {
    setSessionId(sid);
    try {
      const data = await sessionAPI.history(sid);
      setMessages(data.messages || []);
    } catch {
      setMessages([]);
    }
    setCurrentDocId(null);
    setCurrentDocName(null);
  }, []);

  const deleteSession = useCallback(
    async (sid: string) => {
      await sessionAPI.delete(sid);
      if (auth.userId) await refreshSessions(auth.userId);
      if (sid === sessionId) {
        setSessionId(crypto.randomUUID());
        setMessages([]);
      }
    },
    [auth.userId, sessionId, refreshSessions]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setMessages(prev => [...prev, { role: 'user', content: text }]);
      setIsLoading(true);
      try {
        const data = await chatAPI.send(sessionId, text, currentDocId);
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            mode: data.mode as Message['mode'],
            sources: data.sources,
          },
        ]);
        if (auth.userId) await refreshSessions(auth.userId);
      } catch (err: unknown) {
        const detail =
          (err as { response?: { data?: { detail?: string } } }).response?.data?.detail;
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: `Error: ${detail || 'Failed to get response'}` },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [sessionId, currentDocId, auth.userId, refreshSessions]
  );

  const uploadDoc = useCallback(
    async (file: File) => {
      const data = await documentAPI.upload(sessionId, file);
      setCurrentDocId(data.doc_id);
      setCurrentDocName(file.name);
      return { chunk_count: data.chunk_count };
    },
    [sessionId]
  );

  const clearDoc = useCallback(() => {
    setCurrentDocId(null);
    setCurrentDocName(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        auth,
        sessionId,
        messages,
        sessions,
        currentDocId,
        currentDocName,
        isLoading,
        login,
        logout,
        newChat,
        switchSession,
        deleteSession,
        sendMessage,
        uploadDoc,
        clearDoc,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
