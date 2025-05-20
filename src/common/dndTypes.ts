// Common source of truth for D&D classes and races

// D&D 5e core classes (plus Assassin)
export const CHARACTER_CLASSES = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
  'Assassin',
  'Unknown',
] as const;

export type CharacterClass = typeof CHARACTER_CLASSES[number];

// D&D 5e core races
export const CHARACTER_RACES = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Dragonborn',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
  'Unknown',
] as const;

export type CharacterRace = typeof CHARACTER_RACES[number];
