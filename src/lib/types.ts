export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterChoice {
  message: OpenRouterMessage;
  finish_reason: string | null;
}

export interface OpenRouterChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenRouterChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface LLMSettings {
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

export type ErrorType = 'network' | 'auth' | 'rate_limit' | 'llm' | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
}

export type BackendMessageType = 
  | 'BACKEND_EXPLAIN' 
  | 'BACKEND_FACT_CHECK' 
  | 'BACKEND_FETCH_MODELS' 
  | 'BACKEND_TEST_KEY';

export interface BackendMessage {
  type: BackendMessageType;
  payload?: any;
}

export interface BackendResponse<T> {
  success: boolean;
  result?: T;
  error?: AppError;
}