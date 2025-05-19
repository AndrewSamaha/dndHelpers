// Types for the OpenAI API chat completions endpoint

export interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: any;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: any;
    finish_reason: string;
  }>;
  usage: any;
  tool_results?: ToolResult[];
}

export interface ChatCompletionToolCall {
  name: string;
  args: Record<string, any>;
  id: string;
  type: string;
}
