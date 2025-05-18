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
