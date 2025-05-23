import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';
import path from 'path';

const FLOWISE_BASE_URL = 'http://localhost:3200/api/v1/prediction';
const CHATFLOW_ID_NO_EMBEDDED_PROMPTS = '607074c2-f4f8-49ab-85be-9f0b851a1511';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * TypeScript implementation of the curl command in v1.sh
 * Triggers a Flowise chatflow and handles the response
 */
async function triggerChatflow() {
  try {
    const question =
      'Can you create a stat block for my level 4 goblin mage, and have the stat block create a name for him (do not pass in a name)?';
    // Flowise chatflow endpoint
    const url = `${FLOWISE_BASE_URL}/${CHATFLOW_ID_NO_EMBEDDED_PROMPTS}`;

    // console.log('Prompt retrieved:', prompt.prompt);
    console.log('question: ', question);

    // Request payload
    const payload = {
      question,
    };

    console.log('Sending request to Flowise...');

    // Make the request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Process the response
    const data = await response.json();

    if (data.text) {
      console.log('\nResponse text:');
      console.log('-------------');
      console.log(data.text);
      console.log('-------------');
    } else {
      console.log('Full response:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('Error in triggerChatflow:', error);
  }
}

// Execute the function with proper error handling
triggerChatflow().catch((error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});
