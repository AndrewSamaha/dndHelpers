import { NextRequest, NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { RunnableSequence } from '@langchain/core/runnables';
import { tools as appTools } from '@/tools'; // your tool definitions
import { CallbackHandler, Langfuse } from 'langfuse-langchain';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';

// Import modularized components
import { isFlowiseRequest, toLangChainMessages } from './utils';
import { wrapTools, executeToolCalls, processToolResponses } from './toolService';
import { formatResponse } from './responseFormatter';
import { v4 as uuidv4 } from 'uuid';

// Wrap tools with LangChain's tooling
const wrappedTools = wrapTools(appTools);

const getPrompt = async (langfuse: Langfuse, promptName: string) => {
  try {
    const prompt = await langfuse.getPrompt(promptName, undefined, { label: 'test' });
    return prompt;
  } catch (error) {
    console.error(`Error fetching prompt '${promptName}':`, error);
    return null;
  }
};

export async function POST(req: NextRequest) {
  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_API_KEY,
    secretKey: process.env.LANGFUSE_SECRET_API_KEY,
    baseUrl: process.env.LANGFUSE_HOST,
  });

  const trace = langfuse.trace({
    name: 'dndHelpers',
    id: uuidv4(),
  });

  // Create a LangChain-Langfuse handler with our environment variables
  const langfuseHandler = new CallbackHandler({
    // publicKey: process.env.LANGFUSE_PUBLIC_API_KEY,
    // secretKey: process.env.LANGFUSE_SECRET_API_KEY,
    // baseUrl: process.env.LANGFUSE_HOST,
    root: trace,
  });

  // Get the trace object from Langfuse
  console.log(`Starting D&D Helpers API request with Langfuse trace ID: ${trace.id}`);

  const systemPrompt = await getPrompt(langfuseHandler.langfuse, 'dndHelperSystemPrompt');
  if (!systemPrompt) {
    console.error('Prompt not found');
    return;
  }
  console.log('Prompt retrieved:', systemPrompt);

  // Extract the system message content from the Langfuse prompt
  const systemMessageContent =
    typeof systemPrompt.prompt[0] === 'object' && systemPrompt.prompt[0] !== null
      ? (systemPrompt.prompt[0] as { content?: string }).content || ''
      : "The system has failed to retrieve a system prompt; please do your best to satisfy the user's request.";

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

    // Extract the most recent user message
    const userMessages = body.messages.filter((msg: { role: string }) => msg.role === 'user');
    const lastUserMessage = userMessages.at(-1);

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: { message: 'No user message found in the request' } },
        { status: 400 },
      );
    }

    trace.update({
      input: lastUserMessage.content,
    });

    // Initialize Chat model and bind tools
    const chatModel = new ChatOpenAI({
      openAIApiKey,
      modelName: model,
      temperature,
    }).bindTools(wrappedTools);

    // Create a ChatPromptTemplate with a human message template
    const promptTemplate = ChatPromptTemplate.fromMessages([
      ['system', systemMessageContent],
      ['human', '{userMessage}'], // This is a placeholder that will be filled with the user message
    ]).withConfig({
      metadata: { langfusePrompt: systemPrompt }, // Add metadata for Langfuse tracing
    });

    console.log('User message:', lastUserMessage.content);

    // Create a chain that directly combines the prompt template with the chat model
    const chain = promptTemplate.pipe(chatModel);

    // Use LangChain's built-in callback handler for tracing
    const result = await chain.invoke(
      { userMessage: lastUserMessage.content },
      { callbacks: [langfuseHandler] },
    );

    // Execute tool calls if they exist and tool execution is not disabled
    const toolResults = await executeToolCalls(
      result.tool_calls || [],
      appTools,
      body.tool_choice === 'none',
    );

    // Combine conversation tool results with new tool results
    const allToolResults = [...conversationToolResults, ...toolResults];

    trace.update({
      output: allToolResults,
    });
    // Add tool executions to the Langfuse trace
    if (toolResults.length > 0) {
      try {
        // Track tool executions in Langfuse using the same trace
        trace.event({
          name: 'tool_result',
          input: JSON.stringify(result.tool_calls),
          output: JSON.stringify(toolResults),
          metadata: {
            user_prompt: lastUserMessage.content,
            tool_count: toolResults.length,
            tool_names: toolResults.map((t) => t.toolName),
            timestamp: new Date().toISOString(),
            tools_detail: toolResults.map((tr) => ({
              name: tr.toolName,
              id: tr.toolCallId,
              result: tr.result,
            })),
          },
        });

        console.log(`Traced ${toolResults.length} tools in Langfuse`);
      } catch (e) {
        console.error('Error logging tool results to Langfuse:', e);
      }
    }

    // Ensure all tracing data is flushed to Langfuse
    await langfuseHandler.flushAsync();
    console.log('API request completed with Langfuse tracing');

    // Format and return the appropriate response
    return formatResponse(req, body, result, allToolResults, model, false);
  } catch (e: any) {
    console.error('[LangChain API Error]', e);
    return NextResponse.json(
      { error: { message: e.message || 'Internal server error' } },
      { status: 500 },
    );
  }
}
