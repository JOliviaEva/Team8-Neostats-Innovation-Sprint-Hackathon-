import axios from 'axios';
import type { Message, Session } from '../types';

const BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'http://localhost:8000';

const http = axios.create({ baseURL: BASE_URL });


export const sessionAPI = {
  create: (userId?: number) =>
    http.post<{ session_id: string }>('/api/sessions', { user_id: userId }).then(r => r.data),
  list: (userId: number) =>
    http.get<Session[]>(`/api/sessions/${userId}`).then(r => r.data),
  history: (sessionId: string) =>
    http
      .get<{ session_id: string; messages: Message[] }>(`/api/sessions/${sessionId}/history`)
      .then(r => r.data),
  delete: (sessionId: string) =>
    http.delete(`/api/sessions/${sessionId}`).then(r => r.data),
};

export const chatAPI = {
  send: (sessionId: string, message: string, docId?: string | null) =>
    http
      .post<{ response: string; mode: string; sources: string[]; session_id: string }>(
        '/api/chat',
        { session_id: sessionId, message, doc_id: docId },
        { timeout: 60000 }
      )
      .then(r => r.data),
};

export const authAPI = {
  login: (username: string, password: string) =>
    http
      .post<{ token: string; user_id: number; username: string }>('/api/auth/login', { username, password })
      .then(r => r.data),
  register: (username: string, password: string) =>
    http
      .post<{ token: string; user_id: number; username: string }>('/api/auth/register', { username, password })
      .then(r => r.data),
};

export const documentAPI = {
  upload: (sessionId: string, file: File) => {
    const form = new FormData();
    form.append('session_id', sessionId);
    form.append('file', file);
    return http
      .post<{ doc_id: string; filename: string; chunk_count: number }>(
        '/api/documents/upload',
        form,
        { timeout: 120000 }
      )
      .then(r => r.data);
  },
};
