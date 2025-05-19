import { NextRequest } from 'next/server';
import { ToolResult } from './types';
import { extractToolResultTexts } from './utils';

/**
 * Creates a Flowise-compatible response format
 */
export function createFlowiseResponse(
  req: NextRequest,
  body: any,
  result: any,
  toolResults: ToolResult[] = []
) {
  // Determine content to use for response
  let responseContent = result.content || '';

  // Process tool results for text output
  const toolResultTexts = extractToolResultTexts(toolResults);

  // If the content is empty (which is often the case with tool calls),
  // use the tool results as the content
  if (!responseContent && toolResultTexts.length > 0) {
    responseContent = toolResultTexts.join('\n');
  } else if (responseContent && toolResultTexts.length > 0) {
    // Otherwise append the tool results
    responseContent = `${responseContent}\n\n${toolResultTexts.join('\n')}`;
  }

  // For Flowise, we must ensure the text field is populated with tool results
  const flowiseText = responseContent || (toolResultTexts.length > 0 ? toolResultTexts.join('\n') : '');
  
  console.log('Flowise text content:', flowiseText);
  
  // Create Flowise formatted response
  const flowiseResponse = {
    text: flowiseText, // Ensure this is never empty if we have tool results
    question: body.messages[body.messages.length - 1]?.content || '',
    chatId: req.headers.get('x-chat-id') || body.chatId || body.chat_id || '',
    chatMessageId: req.headers.get('x-message-id') || body.chatMessageId || body.message_id || '',
    sessionId: req.headers.get('x-session-id') || body.sessionId || body.session_id || '',
    memoryType: body.memoryType || '',
    // Include raw response for debugging
    rawResponse: {
      tool_calls: result.tool_calls,
      tool_results: toolResults,
    },
  };

  return flowiseResponse;
}
