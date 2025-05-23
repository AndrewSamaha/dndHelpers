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
  level: number | undefined;
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
  level: string;
  name: string;
  characterClass: string;
  race: string;
  intelligence: string;
  wisdom: string;
  charisma: string;
  strength: string;
  dexterity: string;
  constitution: string;
  ac: string;
  hp: string;
  maxHp: string;
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
export function fillStatBlock(
  input: StatBlockInput,
  options?: { showSource?: boolean },
): StatBlockOutput {
  const showSource = options?.showSource ?? true;
  const generateOutput = (
    inputValue: string | number | undefined,
    generator: () => string | number,
  ) => {
    const value = inputValue || generator();
    if (!showSource) {
      return `${value}`;
    }
    return inputValue ? `${value} (PROVIDED_AS_INPUT)` : `${value} (GENERATED_BY_TOOL)`;
  };
  if (input.characterClass && input.characterClass === input.name) {
    input.name = generateFantasyName();
  }
  return {
    level: generateOutput(input.level, () => rollDice(3, 3) - 2),
    name: generateOutput(input.name, () => generateFantasyName()),
    characterClass: generateOutput(input.characterClass, () => randomRace()),
    race: generateOutput(input.race, () => randomRace()),
    intelligence: generateOutput(input.intelligence, () => rollStat()),
    wisdom: generateOutput(input.wisdom, () => rollStat()),
    charisma: generateOutput(input.charisma, () => rollStat()),
    strength: generateOutput(input.strength, () => rollStat()),
    dexterity: generateOutput(input.dexterity, () => rollStat()),
    constitution: generateOutput(input.constitution, () => rollStat()),
    ac: generateOutput(input.ac, () => rollStat()),
    hp: generateOutput(input.hp, () => rollStat()),
    maxHp: generateOutput(input.maxHp, () => rollStat()),
  };
}

/**
 * Dice roll tool for LLM tool usage
 */
export const getStatBlockTool = {
  name: 'getStatBlock',
  description:
    'Fills out a character stat block. Do your best to map input to parameters. Do NOT make up information, just pass values you are given.',
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
      // 'level',
      // 'intelligence',
      // 'wisdom',
      // 'charisma',
      // 'strength',
      // 'dexterity',
      // 'constitution',
      // 'ac',
      // 'hp',
      // 'maxHp',
      // 'name',
      // 'characterClass',
      // 'race',
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
    const result = fillStatBlock(
      {
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
      },
      { showSource: true },
    );
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
