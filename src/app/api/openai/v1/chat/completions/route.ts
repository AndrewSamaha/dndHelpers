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
        ]
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

    // Construct response message, including tool_calls if present
    const message: any = {
      role: 'assistant',
      content: result.content,
    };
    
    // Add tool_calls to the message if they exist
    if (result.tool_calls && result.tool_calls.length > 0) {
      message.tool_calls = result.tool_calls;
    }

    const response = {
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
    return NextResponse.json(response);
  } catch (e: any) {
    console.error('[LangChain API Error]', e);
    return NextResponse.json(
      { error: { message: e.message || 'Internal server error' } },
      { status: 500 },
    );
  }
}
