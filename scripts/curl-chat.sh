curl -X POST http://localhost:3000/api/openai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "user", "content": "Hi!" }
    ],
    "temperature": 0.7
  }'
echo 
