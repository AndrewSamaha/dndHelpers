curl -X POST http://localhost:3001/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful D&D assistant. You can use tools to help with dice rolling." },
      { "role": "user", "content": "Please roll 2d20 for my stealth check" }
    ],
    "temperature": 0.7
  }'
echo 
