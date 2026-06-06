const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  mode?: "general" | "web_search" | "rag";
  sources?: string[];
}

export interface Session {
  session_id: string;
  title?: string;
  doc_name?: string;
  updated_at?: string;
}

export const sessionAPI = {
  create: (userId?: number) =>
    request<{ session_id: string }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    }),
  list: (userId: number) =>
    request<Session[]>(`/api/sessions/${userId}`),
  history: (sessionId: string) =>
    request<{ session_id: string; messages: Message[] }>(
      `/api/sessions/${sessionId}/history`
    ),
  delete: (sessionId: string) =>
    request(`/api/sessions/${sessionId}`, { method: "DELETE" }),
};

export const chatAPI = {
  send: (sessionId: string, message: string, docId?: string | null) =>
    request<{ response: string; mode: string; sources: string[]; session_id: string }>(
      "/api/chat",
      {
        method: "POST",
        body: JSON.stringify({ session_id: sessionId, message, doc_id: docId }),
      }
    ),
};

export const authAPI = {
  login: (username: string, password: string) =>
    request<{ token: string; user_id: number; username: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  register: (username: string, password: string) =>
    request<{ token: string; user_id: number; username: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

export const documentAPI = {
  upload: (sessionId: string, file: File) => {
    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("file", file);
    return fetch(`${BASE_URL}/api/documents/upload`, {
      method: "POST",
      body: form,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Upload failed");
      }
      return res.json() as Promise<{ doc_id: string; filename: string; chunk_count: number }>;
    });
  },
};
