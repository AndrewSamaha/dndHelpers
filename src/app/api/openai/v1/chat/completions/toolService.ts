import { RunnableLambda } from '@langchain/core/runnables';
import { ToolResult } from './types';
import { jsonSchemaToZod } from './utils';

/**
 * Wraps tools with LangChain's RunnableLambda and prepares them for use with the OpenAI API
 */
export function wrapTools(tools: any[]) {
  return tools.map((tool) =>
    RunnableLambda.from(tool.run).asTool({
      name: tool.name,
      description: tool.description,
      schema: jsonSchemaToZod(tool.parameters),
    }),
  );
}

/**
 * Processes tool calls and executes the corresponding tools
 */
export async function executeToolCalls(
  toolCalls: any[],
  tools: any[],
  disableExecution = false
): Promise<ToolResult[]> {
  const toolResults: ToolResult[] = [];

  if (!toolCalls || toolCalls.length === 0 || disableExecution) {
    return toolResults;
  }

  // Process each tool call
  for (const toolCall of toolCalls) {
    // Find the relevant tool
    const tool = tools.find((t) => t.name === toolCall.name);

    if (tool) {
      try {
        // Ensure the arguments have the correct type - this is a simplification, adapt to your tools
        const args = toolCall.args as any;

        // Execute the tool with the provided arguments
        const toolResult = await tool.run(args);

        // Add the result to our tracking array
        toolResults.push({
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          result: toolResult,
        });

        console.log(`Tool ${toolCall.name} executed with result:`, toolResult);
      } catch (error: any) {
        // Type error as any to access message property
        console.error(`Error executing tool ${toolCall.name}:`, error);
        toolResults.push({
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          result: { error: `Failed to execute tool: ${error.message || 'Unknown error'}` },
        });
      }
    }
  }

  return toolResults;
}

/**
 * Processes previous tool responses from the conversation
 */
export function processToolResponses(messages: any[]): ToolResult[] {
  const toolResults: ToolResult[] = [];

  // Check for tool calls in the most recent assistant message and tool results in the subsequent user messages
  for (let i = 0; i < messages.length - 1; i++) {
    const message = messages[i];
    const nextMessage = messages[i + 1];

    // If this is an assistant message with tool_calls and the next is a user message with tool_call_id
    if (
      message.role === 'assistant' &&
      message.tool_calls &&
      nextMessage.role === 'user' &&
      nextMessage.tool_call_id
    ) {
      // Find the matching tool call
      const matchingToolCall = message.tool_calls.find(
        (tc: any) => tc.id === nextMessage.tool_call_id,
      );

      if (matchingToolCall) {
        // Store the result for later processing
        toolResults.push({
          toolCallId: nextMessage.tool_call_id,
          toolName: matchingToolCall.name,
          result: nextMessage.content,
        });
      }
    }
  }

  return toolResults;
}
