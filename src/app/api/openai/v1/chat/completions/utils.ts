import { z } from 'zod';
import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';

/**
 * Converts an array of OpenAI-style messages to LangChain message objects
 */
export function toLangChainMessages(messages: any[]) {
  return messages.map((m) => {
    if (m.role === 'user') return new HumanMessage(m.content);
    if (m.role === 'assistant') return new AIMessage(m.content);
    if (m.role === 'system') return new SystemMessage(m.content);
    return new HumanMessage(m.content); // fallback
  });
}

/**
 * Converts a LangChain message to an OpenAI-style message
 */
export function toOpenAIMessage(message: any) {
  return {
    role: message._getType?.() === 'ai' ? 'assistant' : 'user',
    content: message.content,
  };
}

/**
 * Converts OpenAI-style JSON schema to Zod schema
 */
export function jsonSchemaToZod(schema: any): any {
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

/**
 * Determines if a request is coming from Flowise
 */
export function isFlowiseRequest(req: Request, body: any): boolean {
  // Using URL to parse the request URL
  const url = new URL(req.url);
  
  // Force flag from query params
  const forceFlowiseFormat = url.searchParams.get('format') === 'flowise';
  
  // Check headers
  const headers = new Headers(req.headers);
  const hasFlowiseHeaders =
    headers.get('x-client-type') === 'flowise' || 
    headers.has('x-flowise-signature');
  
  // Check query params
  const hasFlowiseParams = url.searchParams.get('client') === 'flowise';
  
  // Check for specific structure in the request
  const hasFlowiseStructure =
    body.chatId !== undefined || 
    body.sessionId !== undefined || 
    body.memoryType !== undefined;
  
  return forceFlowiseFormat || hasFlowiseHeaders || hasFlowiseParams || hasFlowiseStructure;
}

/**
 * Extracts tool result text from tool results
 */
export function extractToolResultTexts(toolResults: any[]): string[] {
  return toolResults.map((tr) => {
    if (typeof tr.result === 'string') {
      return tr.result;
    } else if (tr.result?.content?.[0]?.text) {
      return tr.result.content[0].text;
    } else {
      return JSON.stringify(tr.result);
    }
  });
}
