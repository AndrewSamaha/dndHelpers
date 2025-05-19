import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import { RunnableSequence, RunnableLambda } from '@langchain/core/runnables';
import { z } from 'zod';
import { tools as appTools } from '@/tools'; // your tool definitions

function toLangChainMessages(messages: any[]) {
  return messages.map((m) => {
    if (m.role === 'user') return new HumanMessage(m.content);
    if (m.role === 'assistant') return new AIMessage(m.content);
    if (m.role === 'system') return new SystemMessage(m.content);
    return new HumanMessage(m.content); // fallback
  });
}

// Define interfaces for our response types
interface ToolResult {
  toolCallId: string;
  toolName: string;
  result: any;
}

interface ChatCompletionResponse {
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

function toOpenAIMessage(message: any) {
  return {
    role: message._getType?.() === 'ai' ? 'assistant' : 'user',
    content: message.content,
  };
}

// Utility: Convert OpenAI-style JSON schema to Zod schema
function jsonSchemaToZod(schema: any): any {
  if (!schema || schema.type !== 'object' || !schema.properties) {
    throw new Error('Only object type schemas are supported');
  }
  const shape: Record<string, any> = {};

  for (const [key, value] of Object.entries(schema.properties as Record<string, any>)) {
    let zodType: any;
    switch (value.type) {
      case 'string':
        zodType = z.string();
        break;
      case 'number':
        zodType = z.number();
        break;
      case 'integer':
        zodType = z.number().int();
        break;
      case 'boolean':
        zodType = z.boolean();
        break;
      default:
        throw new Error(`Unsupported property type: ${value.type}`);
    }
    if (value.description) {
      zodType = zodType.describe(value.description);
    }
    shape[key] = zodType;
  }

  let zodObject = z.object(shape);
  if (Array.isArray(schema.required)) {
    zodObject = zodObject.required(schema.required);
  }
  return zodObject;
}

// Wrap tools with asTool using RunnableLambda and shape schemas on the fly
const wrappedTools = appTools.map((tool) =>
  RunnableLambda.from(tool.run).asTool({
    name: tool.name,
    description: tool.description,
    schema: jsonSchemaToZod(tool.parameters),
  }),
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages;
    console.log(`post body: ${JSON.stringify(body)}`);
    /* example body:
      {
        "model": "gpt-4.1-mini",
        "temperature": 0.9,
        "stream": true,
        "stream_options": { "include_usage": true },
        "messages": [
          { "role": "system", "content": "You are a helpful assistant." },
          { "role": "user", "content": "hi" }
        ],
        "tool_choice": "auto"
      }
    */
    console.log(`post messages: ${JSON.stringify(messages)}`);
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: { message: 'No messages provided.' } }, { status: 400 });
    }

    const openAIApiKey = process.env.OPENAI_API_KEY;
    if (!openAIApiKey) {
      return NextResponse.json({ error: { message: 'Missing OpenAI API key' } }, { status: 500 });
    }

    const model = body.model || 'gpt-4.1-mini';
    const temperature = body.temperature ?? 0.7;
    
    // Check if we need to process tool responses
    let processedMessages = [...messages];
    const toolResults = []; // Store results of tool executions
    
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
          (tc: any) => tc.id === nextMessage.tool_call_id
        );
        
        if (matchingToolCall) {
          // Store the result for later processing
          toolResults.push({
            toolCallId: nextMessage.tool_call_id,
            toolName: matchingToolCall.name,
            result: nextMessage.content
          });
        }
      }
    }

    // Initialize Chat model and bind tools
    const chatModel = new ChatOpenAI({
      openAIApiKey,
      modelName: model,
      temperature,
    }).bindTools(wrappedTools);

    const chain = RunnableSequence.from([
      (input) => toLangChainMessages(input.messages), // not wrapped in { messages: ... }
      chatModel,
    ]);

    const result = await chain.invoke(body);

    console.log('AI content:', result.content);
    console.log('Tool calls:', result.tool_calls);

    // Check if we have tool calls to execute
    if (result.tool_calls && result.tool_calls.length > 0 && body.tool_choice !== 'none') {
      // Process each tool call
      for (const toolCall of result.tool_calls) {
        // Find the relevant tool from our wrapped tools
        const tool = appTools.find(t => t.name === toolCall.name);
        
        if (tool) {
          try {
            // Ensure the arguments have the correct type
            const args = toolCall.args as { numRolls: number; numSides: number; reason?: string };
            
            // Execute the tool with the provided arguments
            const toolResult = await tool.run(args);
            
            // Add the result to our tracking array
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: toolResult
            });
            
            console.log(`Tool ${toolCall.name} executed with result:`, toolResult);
          } catch (error: any) { // Type error as any to access message property
            console.error(`Error executing tool ${toolCall.name}:`, error);
            toolResults.push({
              toolCallId: toolCall.id,
              toolName: toolCall.name,
              result: { error: `Failed to execute tool: ${error.message || 'Unknown error'}` }
            });
          }
        }
      }
    }

    // Construct response message, including tool_calls if present
    const message: any = {
      role: 'assistant',
      content: result.content,
    };
    
    // Add tool_calls to the message if they exist
    if (result.tool_calls && result.tool_calls.length > 0) {
      message.tool_calls = result.tool_calls;
    }

    // Create the response object with our interface type
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
    }
    
    return NextResponse.json(response);
  } catch (e: any) {
    console.error('[LangChain API Error]', e);
    return NextResponse.json(
      { error: { message: e.message || 'Internal server error' } },
      { status: 500 },
    );
  }
}
