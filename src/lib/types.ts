/**
 * Supported parameter names returned by OpenRouter API.
 * @see https://openrouter.ai/docs/api-reference/list-available-models
 */
export type OpenRouterSupportedParameter =
  | "tools"
  | "tool_choice"
  | "max_tokens"
  | "temperature"
  | "top_p"
  | "reasoning"
  | "include_reasoning"
  | "structured_outputs"
  | "response_format"
  | "stop"
  | "frequency_penalty"
  | "presence_penalty"
  | "seed";

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  /** List of supported parameters for this model */
  supported_parameters?: OpenRouterSupportedParameter[];
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
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

export type FactCheckVerdict =
  | "True"
  | "False"
  | "Partially True"
  | "Unverifiable";

export interface ExplainResponse {
  summary: string;
  explanation: string;
  context?: {
    example?: string;
    related_concepts?: string[];
  };
}

export interface FactCheckResponse {
  summary: string;
  verdict: FactCheckVerdict;
  details: string;
  sources?: {
    title: string;
    url: string;
    snippet?: string;
  }[];
}

export interface FactCheckContext {
  paragraph: string;
  pageTitle: string;
  pageDescription: string;
}

export type ErrorType = "network" | "auth" | "rate_limit" | "llm" | "unknown";

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
}

// Message Schema Mapping
export interface MessageSchema {
  BACKEND_EXPLAIN: {
    payload: { text: string; emphasizedWords?: string[] };
    response: ExplainResponse;
  };
  BACKEND_FACT_CHECK: {
    payload: { text: string; context: FactCheckContext; emphasizedWords?: string[] };
    response: FactCheckResponse;
  };
  BACKEND_FETCH_MODELS: {
    payload: undefined;
    response: OpenRouterModel[];
  };
  BACKEND_TEST_KEY: {
    payload: { apiKey: string };
    response: boolean;
  };
  OPEN_OPTIONS: {
    payload: undefined;
    response: void;
  };
}

export type MessageType = keyof MessageSchema;

export interface BackendResponse<T> {
  success: boolean;
  result?: T;
  error?: AppError;
}

/**
 * OpenRouter JSON Schema response format for structured outputs.
 * @see https://openrouter.ai/docs/features/structured-outputs
 */
export interface OpenRouterJsonSchema {
  name: string;
  strict: boolean;
  schema: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
    additionalProperties: boolean;
  };
}

export interface OpenRouterResponseFormat {
  type: "json_schema";
  json_schema: OpenRouterJsonSchema;
}

/**
 * JSON Schema for ExplainResponse - enforces structured output from the LLM.
 */
export const EXPLAIN_RESPONSE_SCHEMA: OpenRouterResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "explain_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "A brief, one-sentence summary of the explanation",
        },
        explanation: {
          type: "string",
          description: "A detailed explanation of the text",
        },
        context: {
          type: "object",
          description: "Optional contextual information",
          properties: {
            example: {
              type: "string",
              description: "A concrete example illustrating the concept",
            },
            related_concepts: {
              type: "array",
              items: { type: "string" },
              description: "Related concepts or terms",
            },
          },
        },
      },
      required: ["summary", "explanation"],
      additionalProperties: false,
    },
  },
};

/**
 * JSON Schema for FactCheckResponse - enforces structured output from the LLM.
 */
export const FACT_CHECK_RESPONSE_SCHEMA: OpenRouterResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "fact_check_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "A brief summary of the claim being checked",
        },
        verdict: {
          type: "string",
          enum: ["True", "False", "Partially True", "Unverifiable"],
          description: "The fact-check verdict",
        },
        details: {
          type: "string",
          description:
            "Detailed explanation of the verdict with supporting evidence",
        },
        sources: {
          type: "array",
          description: "Sources supporting the fact-check",
          items: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "Title of the source",
              },
              url: {
                type: "string",
                description: "URL of the source",
              },
              snippet: {
                type: "string",
                description: "Relevant quote or snippet from the source",
              },
            },
            required: ["title", "url"],
          },
        },
      },
      required: ["summary", "verdict", "details"],
      additionalProperties: false,
    },
  },
};
