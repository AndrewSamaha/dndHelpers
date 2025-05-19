import { NextRequest, NextResponse } from 'next/server';
import { ChatCompletionResponse, ToolResult } from './types';
import { extractToolResultTexts } from './utils';
import { createFlowiseResponse } from './flowiseHandler';

/**
 * Creates a standard OpenAI API formatted response
 */
export function createOpenAIResponse(
  result: any,
  model: string,
  toolResults: ToolResult[] = []
): ChatCompletionResponse {
  // Construct response message, including tool_calls if present
  const message: any = {
    role: 'assistant',
    content: result.content,
  };

  // Add tool_calls to the message if they exist
  if (result.tool_calls && result.tool_calls.length > 0) {
    message.tool_calls = result.tool_calls;
  }

  // Create the response object
  const response: ChatCompletionResponse = {
    id: 'chatcmpl-langchain',
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message,
        finish_reason: result.response_metadata?.finish_reason ?? 'stop',
      },
    ],
    usage: result.response_metadata?.usage ?? {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    },
  };

  // If we have tool results, add them to the response
  if (toolResults.length > 0) {
    response.tool_results = toolResults;
    response.choices[0].message.content = toolResults
      .map((tr) => tr.result.content.map((c: any) => `${c.text}`).join(''))
      .join('\n');
  }

  return response;
}

/**
 * Formats and returns the appropriate response based on client type
 */
export function formatResponse(
  req: NextRequest,
  body: any,
  result: any,
  toolResults: ToolResult[],
  model: string,
  isFlowise: boolean
) {
  if (isFlowise) {
    return NextResponse.json(createFlowiseResponse(req, body, result, toolResults));
  } else {
    return NextResponse.json(createOpenAIResponse(result, model, toolResults));
  }
}
