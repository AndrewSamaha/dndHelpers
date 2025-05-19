import { describe, it, expect } from 'vitest';
import { fillStatBlock, rollStat, StatBlockInput } from './fillStatBlock';

describe('rollStat', () => {
  it('should return a number between 3 and 18', () => {
    // Run the function multiple times to ensure it's working properly
    for (let i = 0; i < 100; i++) {
      const result = rollStat();
      expect(result).toBeGreaterThanOrEqual(3); // Minimum possible (1+1+1)
      expect(result).toBeLessThanOrEqual(18);   // Maximum possible (6+6+6)
    }
  });

  it('should generate different values on subsequent calls', () => {
    // This test might occasionally fail due to randomness, but it's unlikely
    const results = new Set<number>();
    for (let i = 0; i < 20; i++) {
      results.add(rollStat());
    }
    
    // With 20 rolls, we should get at least a few different values
    expect(results.size).toBeGreaterThan(1);
  });
});

describe('fillStatBlock', () => {
  it('uses input values when provided', () => {    
    const input: StatBlockInput = {
      level: 5,
      intelligence: 14,
      wisdom: 12,
      charisma: 10,
      strength: 16,
      dexterity: 15,
      constitution: 13,
      ac: 18,
      hp: 32,
      maxHp: 36
    };

    const result = fillStatBlock(input);

    // Expect output to match input exactly
    expect(result).toEqual(input);
  });

  it('fills in missing values', () => {    
    const input: StatBlockInput = {
      level: 3,
      wisdom: 10,       // provided
      dexterity: 14,    // provided
      intelligence: undefined,
      charisma: undefined,
      strength: undefined,
      constitution: undefined,
      ac: 15,
      hp: 25,
      maxHp: 25
    };

    const result = fillStatBlock(input);

    // Check that provided values are preserved
    expect(result.level).toBe(3);
    expect(result.wisdom).toBe(10);
    expect(result.dexterity).toBe(14);
    expect(result.ac).toBe(15);
    expect(result.hp).toBe(25);
    expect(result.maxHp).toBe(25);
    
    // Check that missing values are filled in with numbers in the valid range
    expect(result.intelligence).toBeGreaterThanOrEqual(3);
    expect(result.intelligence).toBeLessThanOrEqual(18);
    expect(result.charisma).toBeGreaterThanOrEqual(3);
    expect(result.charisma).toBeLessThanOrEqual(18);
    expect(result.strength).toBeGreaterThanOrEqual(3);
    expect(result.strength).toBeLessThanOrEqual(18);
    expect(result.constitution).toBeGreaterThanOrEqual(3);
    expect(result.constitution).toBeLessThanOrEqual(18);
  });
  
  it('handles minimal input', () => {    
    const input: StatBlockInput = {
      level: 1,
      intelligence: undefined,
      wisdom: undefined,
      charisma: undefined,
      strength: undefined,
      dexterity: undefined,
      constitution: undefined,
      ac: undefined,
      hp: undefined,
      maxHp: undefined
    };

    const result = fillStatBlock(input);

    // Level should be preserved
    expect(result.level).toBe(1);
    
    // All ability scores should be in valid range
    expect(result.intelligence).toBeGreaterThanOrEqual(3);
    expect(result.intelligence).toBeLessThanOrEqual(18);
    expect(result.wisdom).toBeGreaterThanOrEqual(3);
    expect(result.wisdom).toBeLessThanOrEqual(18);
    expect(result.charisma).toBeGreaterThanOrEqual(3);
    expect(result.charisma).toBeLessThanOrEqual(18);
    expect(result.strength).toBeGreaterThanOrEqual(3);
    expect(result.strength).toBeLessThanOrEqual(18);
    expect(result.dexterity).toBeGreaterThanOrEqual(3);
    expect(result.dexterity).toBeLessThanOrEqual(18);
    expect(result.constitution).toBeGreaterThanOrEqual(3);
    expect(result.constitution).toBeLessThanOrEqual(18);
    
    // Default values for ac, hp, maxHp should be 0
    expect(result.ac).toBe(0);
    expect(result.hp).toBe(0);
    expect(result.maxHp).toBe(0);
  });
});
