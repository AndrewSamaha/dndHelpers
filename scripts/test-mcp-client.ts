async function main() {
  // @ts-ignore
  const clientModule = await import(
    '../node_modules/@modelcontextprotocol/sdk/dist/esm/client/index.js'
  );
  // @ts-ignore
  const sseModule = await import(
    '../node_modules/@modelcontextprotocol/sdk/dist/esm/client/sse.js'
  );

  // Use the correct properties from the dynamic imports
  // const client = new clientModule.Client({
  //   // transport: new sseModule.SSEClientTransport(new URL('http://localhost:3000/api/mcp/sse')),
  // });

  const urlString = 'http://localhost:3000/';
  console.log(`Using URL: ${urlString}`);

  const client = new clientModule.Client({
    name: 'test-mcp-client',
    version: '0.1.0',
    transport: new sseModule.SSEClientTransport(new URL(urlString)),
  });

  try {
    // Call the getDice tool registered in your MCP server
    // @ts-ignore
    const response = await client.request({
      method: 'roll_dice',
      params: {
        sides: 6,
      },
    });
    console.log('MCP Response:', JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('MCP Request failed:', err);
    process.exit(1);
  }
}

main();
