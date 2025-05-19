/**
 * Interface for dice roll arguments
 */
export interface DiceArgs {
  numRolls: number;
  numSides: number;
  reason?: string;
}

/**
 * Simulates rolling dice.
 * @param numRolls Number of dice to roll
 * @param numSides Number of sides per die
 * @returns Total sum of all dice rolls
 */
export function rollDice(numRolls: number, numSides: number): number {
  let total = 0;
  for (let i = 0; i < numRolls; i++) {
    total += Math.floor(Math.random() * numSides) + 1;
  }
  return total;
}

/**
 * Dice roll tool for LLM tool usage
 */
export const getDiceTool = {
  name: 'getDice',
  description: 'Rolls one or more dice and returns the result.',
  parameters: {
    type: 'object',
    properties: {
      numRolls: {
        type: 'number',
        description: 'Number of dice to roll (e.g., 2 means roll two dice)',
      },
      numSides: {
        type: 'number',
        description: 'Number of sides on each die (e.g., 6 for a standard d6)',
      },
      reason: {
        type: 'string',
        description: 'Reason for rolling the dice (optional)',
      },
    },
    required: ['numRolls', 'numSides'],
  },
  run: async ({ numRolls, numSides, reason }: DiceArgs) => {
    const result = rollDice(numRolls, numSides);
    return {
      content: [
        {
          type: 'text',
          text: `Rolled ${numRolls}d${numSides}${reason ? ` (${reason})` : ''}: ${result}`,
        },
      ],
    };
  },
};
