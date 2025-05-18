import { rollDice } from './dice/dice';

// Define your tools
// interface DiceArgs {
//   numRolls: number;
//   numSides: number;
//   reason?: string;
// }

export const tools = [
  {
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
    run: async ({
      numRolls,
      numSides,
      reason,
    }: {
      numRolls: number;
      numSides: number;
      reason?: string;
    }) => {
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
  },
];
