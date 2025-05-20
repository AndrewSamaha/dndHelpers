import { rollDice } from '@/tools/dice/dice';
import { generateFantasyName } from '@/tools/name/name';
import {
  CharacterClass,
  CharacterRace,
  CHARACTER_CLASSES,
  CHARACTER_RACES,
} from '@/common/dndTypes';

/**
 * Interface for dice roll arguments
 */

export interface StatBlockInput {
  level: number;
  name: string | undefined;
  characterClass: CharacterClass | undefined;
  race: CharacterRace | undefined;
  intelligence: number | undefined;
  wisdom: number | undefined;
  charisma: number | undefined;
  strength: number | undefined;
  dexterity: number | undefined;
  constitution: number | undefined;
  ac: number | undefined;
  hp: number | undefined;
  maxHp: number | undefined;
}

export interface StatBlockOutput {
  level: number;
  name: string;
  characterClass: CharacterClass;
  race: CharacterRace;
  intelligence: number;
  wisdom: number;
  charisma: number;
  strength: number;
  dexterity: number;
  constitution: number;
  ac: number;
  hp: number;
  maxHp: number;
}

export function rollStat(): number {
  return Array.from({ length: 4 }, () => rollDice(1, 6))
    .sort((a, b) => a - b)
    .slice(1)
    .reduce((a, b) => a + b, 0);
}

export function randomRace(): CharacterRace {
  return CHARACTER_RACES[Math.floor(Math.random() * CHARACTER_RACES.length)];
}

/**
 * Simulates rolling dice.
 * @param numRolls Number of dice to roll
 * @param numSides Number of sides per die
 * @returns Total sum of all dice rolls
 */
export function fillStatBlock(input: StatBlockInput): StatBlockOutput {
  return {
    level: input.level,
    name: input.name || generateFantasyName(),
    characterClass: input.characterClass || 'Unknown',
    race: input.race || randomRace(),
    intelligence: input.intelligence || rollStat(),
    wisdom: input.wisdom || rollStat(),
    charisma: input.charisma || rollStat(),
    strength: input.strength || rollStat(),
    dexterity: input.dexterity || rollStat(),
    constitution: input.constitution || rollStat(),
    ac: input.ac || 0,
    hp: input.hp || 0,
    maxHp: input.maxHp || 0,
  };
}

/**
 * Dice roll tool for LLM tool usage
 */
export const getStatBlockTool = {
  name: 'getStatBlock',
  description: 'Fills out a character stat block. Do your best to map input to parameters.',
  parameters: {
    type: 'object',
    properties: {
      level: {
        type: 'number',
        description: "The character's level",
      },
      name: {
        type: 'string',
        description: "The character's name (different from characterClass or race)",
      },
      characterClass: {
        type: 'string',
        description: `The character's class. Options: ${CHARACTER_CLASSES.join(', ')}`,
        enum: [...CHARACTER_CLASSES],
      },
      race: {
        type: 'string',
        description: `The character's race. Options: ${CHARACTER_RACES.join(', ')}`,
        enum: [...CHARACTER_RACES],
      },
      intelligence: {
        type: 'number',
        description: "The character's intelligence",
      },
      wisdom: {
        type: 'number',
        description: "The character's wisdom",
      },
      charisma: {
        type: 'number',
        description: "The character's charisma",
      },
      strength: {
        type: 'number',
        description: "The character's strength",
      },
      dexterity: {
        type: 'number',
        description: "The character's dexterity",
      },
      constitution: {
        type: 'number',
        description: "The character's constitution",
      },
      ac: {
        type: 'number',
        description: "The character's ac",
      },
      hp: {
        type: 'number',
        description: "The character's hp",
      },
      maxHp: {
        type: 'number',
        description: "The character's max hp",
      },
    },
    required: [
      'level',
      'intelligence',
      'wisdom',
      'charisma',
      'strength',
      'dexterity',
      'constitution',
      'ac',
      'hp',
      'maxHp',
      'name',
      'characterClass',
      'race',
    ],
  },
  run: async ({
    level,
    intelligence,
    wisdom,
    charisma,
    strength,
    dexterity,
    constitution,
    ac,
    hp,
    maxHp,
    name,
    characterClass,
    race,
  }: StatBlockInput) => {
    const result = fillStatBlock({
      level,
      intelligence,
      wisdom,
      charisma,
      strength,
      dexterity,
      constitution,
      ac,
      hp,
      maxHp,
      name,
      characterClass,
      race,
    });
    return {
      content: [
        {
          type: 'text',
          text: `Filled out character stat block: ${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  },
};
