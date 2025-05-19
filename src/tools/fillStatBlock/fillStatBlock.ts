import { rollDice } from '@/tools/dice/dice';
/**
 * Interface for dice roll arguments
 */

export interface StatBlockInput {
  level: number;
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

/**
 * Simulates rolling dice.
 * @param numRolls Number of dice to roll
 * @param numSides Number of sides per die
 * @returns Total sum of all dice rolls
 */
export function fillStatBlock(input: StatBlockInput): StatBlockOutput {
  return {
    level: input.level,
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
  description: 'Fills out a character stat block',
  parameters: {
    type: 'object',
    properties: {
      level: {
        type: 'number',
        description: "The character's level",
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
    });
    return {
      content: [
        {
          type: 'text',
          text: `Filled out character stat block: ${JSON.stringify(result)}`,
        },
      ],
    };
  },
};
