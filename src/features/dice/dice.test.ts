import { rollDice } from './dice';

describe('rollDice', () => {
  it('returns a number within the expected range for 1d6', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice(1, 6);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });

  it('returns a number within the expected range for 3d8', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollDice(3, 8);
      expect(result).toBeGreaterThanOrEqual(3);
      expect(result).toBeLessThanOrEqual(24);
    }
  });

  it('returns 0 if 0 dice are rolled', () => {
    expect(rollDice(0, 6)).toBe(0);
  });
});
