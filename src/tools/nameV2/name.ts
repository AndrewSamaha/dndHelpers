class FantasyNameGenerator {
  onsets: string[];
  vowels: string[];
  codas: string[];
  syllablePatterns: boolean[][];
  minSyllables: number;
  maxSyllables: number;

  constructor() {
    this.onsets = [
      '',
      'b',
      'br',
      'bl',
      'c',
      'cr',
      'cl',
      'd',
      'dr',
      'f',
      'fr',
      'fl',
      'g',
      'gr',
      'gl',
      'h',
      'j',
      'k',
      'kr',
      'kl',
      'l',
      'm',
      'n',
      'p',
      'pr',
      'pl',
      'qu',
      'r',
      's',
      'st',
      'str',
      'sl',
      't',
      'tr',
      'v',
      'w',
      'z',
      'zh',
      'sh',
      'ch',
    ];

    this.vowels = [
      'a',
      'e',
      'i',
      'o',
      'u',
      'ae',
      'ai',
      'au',
      'ea',
      'ee',
      'ei',
      'io',
      'oa',
      'oe',
      'oo',
      'ou',
      'ua',
      'ue',
      'ui',
    ];

    this.codas = [
      '',
      'b',
      'd',
      'g',
      'k',
      'l',
      'm',
      'n',
      'r',
      's',
      't',
      'th',
      'nd',
      'st',
      'nt',
      'rk',
      'rd',
      'sh',
      'ss',
      'zz',
      'ck',
    ];

    this.syllablePatterns = [
      [true, true, true],
      [true, true, false],
      [false, true, true],
      [false, true, false],
    ];

    this.minSyllables = 2;
    this.maxSyllables = 4;
  }

  // Updated method that handles nested arrays:
  getRandomElement<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)];
  }

  generateSyllable() {
    const pattern = this.getRandomElement(this.syllablePatterns);
    const onset = pattern[0] ? this.getRandomElement(this.onsets) : '';
    const vowel = pattern[1] ? this.getRandomElement(this.vowels) : '';
    const coda = pattern[2] ? this.getRandomElement(this.codas) : '';
    return onset + vowel + coda;
  }

  generateName() {
    const syllableCount =
      Math.floor(Math.random() * (this.maxSyllables - this.minSyllables + 1)) + this.minSyllables;
    const nameSyllables = [];

    for (let i = 0; i < syllableCount; i++) {
      let syll = this.generateSyllable();

      if (i > 0) {
        const prevCodaLastChar = nameSyllables[i - 1].slice(-1);
        let onsetFirstChar = syll[0] || '';
        let trials = 0;
        while (onsetFirstChar === prevCodaLastChar && trials < 5) {
          syll = this.generateSyllable();
          onsetFirstChar = syll[0] || '';
          trials++;
        }
      }

      nameSyllables.push(syll);
    }

    const name = nameSyllables.join('');
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}

// Example usage:
export const generateFantasyName = () => {
  const generator = new FantasyNameGenerator();
  return generator.generateName();
};
