import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { tools as appTools } from '@/tools'; // your tool definitions

// Import modularized components
import { isFlowiseRequest, toLangChainMessages } from './utils';
import { wrapTools, executeToolCalls, processToolResponses } from './toolService';
import { formatResponse } from './responseFormatter';

// Wrap tools with LangChain's tooling
const wrappedTools = wrapTools(appTools);

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

    // Process any existing tool responses in the conversation
    const conversationToolResults = processToolResponses(messages);

    // Initialize Chat model and bind tools
    const chatModel = new ChatOpenAI({
      openAIApiKey,
      modelName: model,
      temperature,
    }).bindTools(wrappedTools);

    const chain = RunnableSequence.from([
      (input) => toLangChainMessages(input.messages),
      chatModel,
    ]);

    const result = await chain.invoke(body);

    console.log('AI content:', result.content);
    console.log('Tool calls:', result.tool_calls);

    // Execute tool calls if they exist and tool execution is not disabled
    const toolResults = await executeToolCalls(
      result.tool_calls || [],
      appTools,
      body.tool_choice === 'none'
    );

    // Combine conversation tool results with new tool results
    const allToolResults = [...conversationToolResults, ...toolResults];

    // Determine if this is a Flowise request
    const isFlowise = isFlowiseRequest(req, body);
    console.log(`isFlowiseRequest: ${isFlowise}`);

    // Format and return the appropriate response
    return formatResponse(req, body, result, allToolResults, model, isFlowise);
  } catch (e: any) {
    console.error('[LangChain API Error]', e);
    return NextResponse.json(
      { error: { message: e.message || 'Internal server error' } },
      { status: 500 },
    );
  }
}
