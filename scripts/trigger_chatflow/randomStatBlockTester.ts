import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';
import path from 'path';
import {
  CharacterClass,
  CharacterRace,
  CHARACTER_CLASSES,
  CHARACTER_RACES,
} from '@/common/dndTypes';

const FLOWISE_BASE_URL = 'http://localhost:3200/api/v1/prediction';
const CHATFLOW_ID_NO_EMBEDDED_PROMPTS = '607074c2-f4f8-49ab-85be-9f0b851a1511';

// Load environment variables from .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Configuration for random stat block generator
 */
interface StatBlockGenConfig {
  // How many random prompts to generate and send
  batchSize: number;
  // Probability (0-1) that each field will be included in the prompt
  fieldInclusionProbability: number;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random fantasy name
 */
function getRandomName(): string {
  const firstNames = [
    'Thorn',
    'Eldrin',
    'Aria',
    'Gareth',
    'Lyra',
    'Kael',
    'Seraphina',
    'Draven',
    'Isolde',
    'Fenris',
    'Sylvia',
    'Thorne',
    'Elara',
    'Orion',
    'Nova',
  ];

  const lastNames = [
    'Shadowblade',
    'Ironheart',
    'Stormweaver',
    'Frostwhisper',
    'Nightshade',
    'Sunseeker',
    'Moonshadow',
    'Duskwalker',
    'Flameheart',
    'Starfall',
  ];

  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

/**
 * Get a random character class
 */
function getRandomClass(): CharacterClass {
  return CHARACTER_CLASSES[Math.floor(Math.random() * CHARACTER_CLASSES.length)] as CharacterClass;
}

/**
 * Get a random character race
 */
function getRandomRace(): CharacterRace {
  return CHARACTER_RACES[Math.floor(Math.random() * CHARACTER_RACES.length)] as CharacterRace;
}

/**
 * Generate prompt templates for different combinations of parameters
 */
function getPromptTemplates(): string[] {
  return [
    'Can you create a stat block for a {race} {class} at level {level}?',
    'I need a character sheet for my {level}th level {race} {class} named {name}.',
    'Generate a {race} {class} with {strength} strength, {dexterity} dexterity, and {constitution} constitution.',
    'Make a character with {intelligence} intelligence, {wisdom} wisdom, and {charisma} charisma.',
    'I want a stat block for a {race} with {hp} hit points and {ac} armor class.',
    'Help me build a {class} character that has {strength} strength and {intelligence} intelligence.',
    'Create a D&D character that is level {level} with {maxHp} maximum hit points.',
    'Generate a level {level} {class} with {strength} strength, {dexterity} dexterity, {constitution} constitution, {intelligence} intelligence, {wisdom} wisdom, and {charisma} charisma.',
    'Build me a {race} {class} with an armor class of {ac} and {hp} hit points.',
    "I'm making a {race} character with {strength} strength. What would a complete stat block look like?",
    'Create a level {level} character with {hp} hit points.',
    'Can you generate a {race} stat block for me?',
    'I need stats for a {class} with {dexterity} dexterity and {constitution} constitution.',
    'Please create a character named {name}.',
    'Help me with a stat block for a {class} that has {maxHp} maximum hit points.',
  ];
}

/**
 * Generate a random prompt by selecting a template and filling in random values
 * for some of the parameters based on the inclusion probability
 */
function generateRandomPrompt(config: StatBlockGenConfig): string {
  const templates = getPromptTemplates();
  const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

  // Create a map of potential replacements
  const replacements: Record<string, string> = {};
  replacements['name'] = getRandomName();
  replacements['class'] = getRandomClass();
  replacements['race'] = getRandomRace();
  replacements['level'] = getRandomInt(1, 20).toString();
  replacements['intelligence'] = getRandomInt(3, 18).toString();
  replacements['wisdom'] = getRandomInt(3, 18).toString();
  replacements['charisma'] = getRandomInt(3, 18).toString();
  replacements['strength'] = getRandomInt(3, 18).toString();
  replacements['dexterity'] = getRandomInt(3, 18).toString();
  replacements['constitution'] = getRandomInt(3, 18).toString();
  replacements['ac'] = getRandomInt(10, 20).toString();
  replacements['hp'] = getRandomInt(5, 100).toString();
  replacements['maxHp'] = getRandomInt(5, 100).toString();
  // For each possible field, decide whether to include it based on probability
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['level'] = getRandomInt(1, 20).toString();
  // if (Math.random() < config.fieldInclusionProbability) replacements['class'] = getRandomClass();
  // if (Math.random() < config.fieldInclusionProbability) replacements['race'] = getRandomRace();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['intelligence'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['wisdom'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['charisma'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['strength'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['dexterity'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['constitution'] = getRandomInt(3, 18).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['ac'] = getRandomInt(10, 20).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['hp'] = getRandomInt(5, 100).toString();
  // if (Math.random() < config.fieldInclusionProbability)
  //   replacements['maxHp'] = getRandomInt(5, 100).toString();

  // Replace placeholders in the template with actual values or leave them as is if not included
  let prompt = selectedTemplate;

  // Find all placeholders in the template using regex
  const placeholders = selectedTemplate.match(/{([^}]+)}/g) || [];

  // For each placeholder, either replace it with a value or remove that portion of the prompt
  for (const placeholder of placeholders) {
    const fieldName = placeholder.slice(1, -1); // Remove the { }

    if (replacements[fieldName]) {
      prompt = prompt.replace(placeholder, replacements[fieldName]);
    } else {
      // If we don't have a replacement, we need to handle the template differently
      // This makes sure we don't have weird templates with missing placeholders

      // If the placeholder is for a fundamental property like race or class, we may
      // want to replace it with a generic term
      if (fieldName === 'race') {
        prompt = prompt.replace(placeholder, 'character');
      } else if (fieldName === 'class') {
        prompt = prompt.replace(placeholder, 'adventurer');
      } else if (fieldName === 'level') {
        prompt = prompt.replace(`level {level}`, 'character');
      } else if (fieldName === 'name') {
        prompt = prompt.replace(`named {name}`, '');
      } else {
        // For other placeholders, remove the phrase containing the placeholder
        // This regex looks for phrases like "with {strength} strength" and removes them
        const phraseRegex = new RegExp(
          `\\s*(?:with|has|that has|and)\\s+${placeholder}\\s+${fieldName}(?:,|\\s|\\.|$)`,
          'i',
        );
        prompt = prompt.replace(phraseRegex, (match) => {
          // If the match ends with a period or comma, preserve it
          const lastChar = match.charAt(match.length - 1);
          return lastChar === '.' || lastChar === ',' ? lastChar : '';
        });

        // If we still have the placeholder, just remove it and the word after it
        const simpleRegex = new RegExp(`${placeholder}\\s+${fieldName}(?:,|\\s|\\.|$)`, 'i');
        prompt = prompt.replace(simpleRegex, (match) => {
          const lastChar = match.charAt(match.length - 1);
          return lastChar === '.' || lastChar === ',' ? lastChar : '';
        });

        // If the placeholder is still there, just remove it
        prompt = prompt.replace(placeholder, '');
      }
    }
  }

  // Clean up any awkward phrasings or punctuation that might have resulted
  prompt = prompt
    .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/,\s*,/g, ',') // Replace consecutive commas
    .replace(/\s+\./g, '.') // Remove spaces before periods
    .replace(/\s+,/g, ',') // Remove spaces before commas
    .replace(/\.\s*,/g, '.') // Remove comma after period
    .replace(/,\s*\./g, '.') // Remove comma before period
    .replace(/^\s+|\s+$/g, ''); // Trim whitespace

  // Make sure the prompt ends with a proper punctuation
  if (!/[.?!]$/.test(prompt)) {
    prompt += '.';
  }

  return prompt;
}

/**
 * Sends a random stat block prompt to the Flowise API
 */
async function sendRandomPrompt(config: StatBlockGenConfig): Promise<void> {
  const prompt = generateRandomPrompt(config);

  try {
    console.log('\n--------------------------------');
    console.log(`Sending prompt: "${prompt}"`);

    // Flowise chatflow endpoint
    const url = `${FLOWISE_BASE_URL}/${CHATFLOW_ID_NO_EMBEDDED_PROMPTS}`;

    // Request payload
    const payload = {
      question: prompt,
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
    console.error('Error sending random prompt:', error);
  }
}

/**
 * Main function to run the random stat block tester
 */
async function runRandomStatBlockTests(config: StatBlockGenConfig): Promise<void> {
  console.log(`Starting random stat block tests with batch size: ${config.batchSize}`);
  console.log(`Field inclusion probability: ${config.fieldInclusionProbability * 100}%`);

  for (let i = 0; i < config.batchSize; i++) {
    console.log(`\n=== Test ${i + 1} of ${config.batchSize} ===`);
    await sendRandomPrompt(config);

    // Add a small delay between requests to avoid overwhelming the server
    if (i < config.batchSize - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  console.log('\nRandom stat block testing complete!');
}

// Configuration
const config: StatBlockGenConfig = {
  batchSize: 1, // Number of random prompts to generate and test
  fieldInclusionProbability: 0.6, // 60% chance each field will be included
};

// Execute the tests with proper error handling
runRandomStatBlockTests(config).catch((error) => {
  console.error('Unhandled promise rejection:', error);
  process.exit(1);
});
