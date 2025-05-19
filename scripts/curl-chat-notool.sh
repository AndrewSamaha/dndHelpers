curl -X POST http://localhost:3001/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful D&D assistant. You can use tools to help with dice rolling." },
      { "role": "user", "content": "Is a thief more likely to use a longbow or a dagger?" }
    ],
    "temperature": 0.3
  }'
echo 
