export const generateFantasyName = (): string => {
  const beginnings = [
    'Al',
    'Bar',
    'Cal',
    'Da',
    'El',
    'Fa',
    'Gal',
    'Har',
    'Is',
    'Jar',
    'Ka',
    'Lor',
    'Mor',
    'Nor',
    'Or',
    'Per',
    'Qua',
    'Ra',
    'Sar',
    'Tor',
    'Ur',
    'Vor',
    'Wyn',
    'Xan',
    'Yar',
    'Zul',
  ];
  const middles = [
    'a',
    'e',
    'i',
    'o',
    'u',
    'ae',
    'ia',
    'ei',
    'oo',
    'ou',
    'ar',
    'ir',
    'or',
    'ul',
    'an',
    'en',
  ];
  const ends = [
    'dor',
    'ron',
    'mir',
    'rak',
    'lius',
    'tar',
    'wen',
    'dil',
    'thas',
    'mon',
    'ric',
    'zan',
    'lith',
    'gorn',
    'dras',
    'thus',
  ];

  const start = beginnings[Math.floor(Math.random() * beginnings.length)];
  const middle = Math.random() < 0.5 ? middles[Math.floor(Math.random() * middles.length)] : '';
  const end = ends[Math.floor(Math.random() * ends.length)];

  // Capitalize the result just in case
  const name = (start + middle + end).replace(/^\w/, (c) => c.toUpperCase());

  return name;
};
