#!/bin/bash

# This script simulates a Flowise request to test our compatibility layer

# Test case 1: Using query parameters
echo "\n=== Test 1: Using query parameters ==="
curl -X POST "http://localhost:3001/api/openai/v1/chat/completions?format=flowise" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful D&D assistant. You can use tools to help with dice rolling." },
      { "role": "user", "content": "Please roll 3d6 to calculate damage for my blade" }
    ],
    "temperature": 0.7
  }'

# Test case 2: Using Flowise-style body structure
echo "\n\n=== Test 2: Using Flowise-style body structure ==="
curl -X POST "http://localhost:3001/api/openai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful D&D assistant. You can use tools to help with dice rolling." },
      { "role": "user", "content": "Please roll 2d12 for my fireball spell" }
    ],
    "temperature": 0.7,
    "chatId": "d6d35b71-9113-4553-aaf7-46ce06f5113a",
    "chatMessageId": "b3c987d8-9923-4daa-b2a0-012a1fbdeb60",
    "sessionId": "d6d35b71-9113-4553-aaf7-46ce06f5113a",
    "memoryType": "Buffer Memory"
  }'

# Test case 3: Using Flowise headers
echo "\n\n=== Test 3: Using Flowise headers ==="
curl -X POST "http://localhost:3001/api/openai/v1/chat/completions" \
  -H "Content-Type: application/json" \
  -H "x-flowise-signature: test-signature" \
  -H "x-chat-id: test-chat-id" \
  -d '{
    "model": "gpt-4.1-mini",
    "messages": [
      { "role": "system", "content": "You are a helpful D&D assistant. You can use tools to help with dice rolling." },
      { "role": "user", "content": "Please roll 1d20 for my perception check" }
    ],
    "temperature": 0.7
  }'

echo
