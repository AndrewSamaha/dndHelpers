import { NextRequest, NextResponse } from 'next/server';
import { tools } from '@/tools';

// MCP server route handler for POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { method, params } = body;
    console.log(`POST [MCP API] Body: ${JSON.stringify(body)}`);
    console.log(`  Method: ${method}`);
    console.log(`  Params: ${JSON.stringify(params)}`);
    // Find the tool by name
    const tool = tools.find((t) => t.name === method || t.name === method.replace(/_/g, ''));
    if (!tool) {
      console.log(`Tool not found, body: ${JSON.stringify(body)}`);
      return NextResponse.json({ error: `Tool '${method}' not found.` }, { status: 404 });
    }

    // Validate parameters if a schema is present
    if (tool.parameters && tool.parameters.required) {
      for (const param of tool.parameters.required) {
        if (!(param in params)) {
          console.log(`Missing required parameter: ${param}`);
          console.log(`Params: ${JSON.stringify(params)}`);
          return NextResponse.json(
            { error: `Missing required parameter: ${param}` },
            { status: 400 },
          );
        }
      }
    }

    // Run the tool
    const result = await tool.run(params);
    return NextResponse.json({ result });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request', cause: String(e) }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  // Optionally, list available tools
  console.log(`GET [MCP API] requesting available tools`);
  const availableTools = tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.parameters,
  }));
  return NextResponse.json({ tools: availableTools });
}
