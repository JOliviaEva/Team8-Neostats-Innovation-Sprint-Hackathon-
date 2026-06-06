export interface Message {
  role: 'user' | 'assistant';
  content: string;
  mode?: 'general' | 'web_search' | 'rag';
  sources?: string[];
}

export interface Session {
  session_id: string;
  title: string;
  doc_name?: string | null;
  updated_at?: string | null;
}
