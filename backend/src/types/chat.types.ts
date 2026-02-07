export interface ChatSession {
  id: string;
  employee_id: string;
  started_at: Date;
  ended_at: Date | null;
  session_metadata: SessionMetadata;
  total_messages: number;
}

export interface SessionMetadata {
  context?: Record<string, unknown>;
  user_preferences?: Record<string, unknown>;
  last_intent?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: MessageRole;
  content: string;
  intent: string | null;
  confidence_score: number | null;
  metadata: MessageMetadata;
  created_at: Date;
}

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageMetadata {
  model?: string;
  tokens_used?: number;
  sources?: PolicySource[];
  [key: string]: unknown;
}

export interface PolicySource {
  policy_id: string;
  title: string;
  relevance_score: number;
}

export interface SendMessageDto {
  content: string;
}

export interface ChatResponse {
  message: ChatMessage;
  sources?: PolicySource[];
}

export interface IntentClassification {
  intent: Intent;
  confidence: number;
  entities: ExtractedEntities;
}

export type Intent = 
  | 'policy_question'
  | 'request_submission'
  | 'status_check'
  | 'general_inquiry'
  | 'greeting'
  | 'unknown';

export interface ExtractedEntities {
  request_type?: string;
  dates?: string[];
  amounts?: number[];
  [key: string]: unknown;
}
