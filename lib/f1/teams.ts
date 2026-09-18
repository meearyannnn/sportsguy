import { TeamMeta } from './types';

export const F1_TEAMS: Record<string, TeamMeta> = {
  ferrari: {
    id: 'ferrari',
    name: 'Ferrari',
    fullName: 'Scuderia Ferrari HP',
    color: '#E8002D',
    secondaryColor: '#FFF200',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(232, 0, 45, 0.4)',
    powerUnit: 'Ferrari',
    base: 'Maranello, Italy',
    teamPrincipal: 'Frédéric Vasseur',
    technicalChief: 'Loïc Serra',
    chassis: 'SF-25',
    firstEntry: '1950',
    championships: 16,
    drivers: ['leclerc', 'hamilton', 'sainz'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/ferrari/2026ferrarilogowhite.webp',
  },
  mclaren: {
    id: 'mclaren',
    name: 'McLaren',
    fullName: 'McLaren Formula 1 Team',
    color: '#FF8000',
    secondaryColor: '#47C7FC',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(255, 128, 0, 0.4)',
    powerUnit: 'Mercedes',
    base: 'Woking, United Kingdom',
    teamPrincipal: 'Andrea Stella',
    technicalChief: 'Peter Prodromou',
    chassis: 'MCL39',
    firstEntry: '1966',
    championships: 8,
    drivers: ['norris', 'piastri'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarenlogowhite.webp',
  },
  mercedes: {
    id: 'mercedes',
    name: 'Mercedes',
    fullName: 'Mercedes-AMG PETRONAS F1 Team',
    color: '#27F4D2',
    secondaryColor: '#C0C0C0',
    textColor: '#0A0A0F',
    accentGlow: 'rgba(39, 244, 210, 0.4)',
    powerUnit: 'Mercedes',
    base: 'Brackley, United Kingdom',
    teamPrincipal: 'Toto Wolff',
    technicalChief: 'James Allison',
    chassis: 'W16',
    firstEntry: '1970',
    championships: 8,
    drivers: ['russell', 'antonelli'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedeslogowhite.webp',
  },
  red_bull: {
    id: 'red_bull',
    name: 'Red Bull Racing',
    fullName: 'Oracle Red Bull Racing',
    color: '#3671C6',
    secondaryColor: '#FCD800',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(54, 113, 198, 0.4)',
    powerUnit: 'Honda RBPT',
    base: 'Milton Keynes, United Kingdom',
    teamPrincipal: 'Christian Horner',
    technicalChief: 'Pierre Waché',
    chassis: 'RB21',
    firstEntry: '1997',
    championships: 6,
    drivers: ['max_verstappen', 'lawson', 'perez'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracinglogowhite.webp',
  },
  aston_martin: {
    id: 'aston_martin',
    name: 'Aston Martin',
    fullName: 'Aston Martin Aramco F1 Team',
    color: '#229971',
    secondaryColor: '#CEDC00',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(34, 153, 113, 0.4)',
    powerUnit: 'Mercedes',
    base: 'Silverstone, United Kingdom',
    teamPrincipal: 'Mike Krack',
    technicalChief: 'Enrico Cardile',
    chassis: 'AMR25',
    firstEntry: '2018',
    championships: 0,
    drivers: ['alonso', 'stroll'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartinlogowhite.webp',
  },
  alpine: {
    id: 'alpine',
    name: 'Alpine',
    fullName: 'BWT Alpine F1 Team',
    color: '#0090FF',
    secondaryColor: '#FF87BC',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(0, 144, 255, 0.4)',
    powerUnit: 'Renault',
    base: 'Enstone, United Kingdom',
    teamPrincipal: 'Oliver Oakes',
    technicalChief: 'David Sanchez',
    chassis: 'A525',
    firstEntry: '1986',
    championships: 2,
    drivers: ['gasly', 'doohan'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/alpine/2026alpinelogowhite.webp',
  },
  williams: {
    id: 'williams',
    name: 'Williams',
    fullName: 'Williams Racing',
    color: '#64C4FF',
    secondaryColor: '#002F6C',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(100, 196, 255, 0.4)',
    powerUnit: 'Mercedes',
    base: 'Grove, United Kingdom',
    teamPrincipal: 'James Vowles',
    technicalChief: 'Pat Fry',
    chassis: 'FW47',
    firstEntry: '1978',
    championships: 9,
    drivers: ['albon', 'sainz', 'colapinto'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/williams/2026williamslogowhite.webp',
  },
  rb: {
    id: 'rb',
    name: 'Racing Bulls',
    fullName: 'Visa Cash App RB F1 Team',
    color: '#6692FF',
    secondaryColor: '#E8002D',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(102, 146, 255, 0.4)',
    powerUnit: 'Honda RBPT',
    base: 'Faenza, Italy',
    teamPrincipal: 'Laurent Mekies',
    technicalChief: 'Tim Goss',
    chassis: 'VCARB 02',
    firstEntry: '1985',
    championships: 0,
    drivers: ['tsunoda', 'hadjar', 'lawson'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullslogowhite.webp',
  },
  haas: {
    id: 'haas',
    name: 'Haas',
    fullName: 'MoneyGram Haas F1 Team',
    color: '#E6002B',
    secondaryColor: '#B6BABD',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(230, 0, 43, 0.4)',
    powerUnit: 'Ferrari',
    base: 'Kannapolis, United States',
    teamPrincipal: 'Ayao Komatsu',
    technicalChief: 'Andrea De Zordo',
    chassis: 'VF-25',
    firstEntry: '2016',
    championships: 0,
    drivers: ['bearman', 'ocon'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamcarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/haasf1team/2026haasf1teamlogowhite.webp',
  },
  sauber: {
    id: 'sauber',
    name: 'Kick Sauber',
    fullName: 'Stake F1 Team Kick Sauber',
    color: '#52E252',
    secondaryColor: '#000000',
    textColor: '#0A0A0F',
    accentGlow: 'rgba(82, 226, 82, 0.4)',
    powerUnit: 'Ferrari',
    base: 'Hinwil, Switzerland',
    teamPrincipal: 'Mattia Binotto',
    technicalChief: 'James Key',
    chassis: 'C45',
    firstEntry: '1993',
    championships: 0,
    drivers: ['hulkenberg', 'bortoleto'],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/audi/2026audilogowhite.webp',
  },
  cadillac: {
    id: 'cadillac',
    name: 'Cadillac',
    fullName: 'Cadillac Formula 1 Team',
    color: '#D4AF37',
    secondaryColor: '#1E1E1E',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(212, 175, 55, 0.4)',
    powerUnit: 'Ferrari / GM',
    base: 'Fishers, Indiana, USA',
    teamPrincipal: 'Graeme Lowdon',
    technicalChief: 'Nick Chester',
    chassis: 'MAC-01',
    firstEntry: '2026',
    championships: 0,
    drivers: [],
    carImageUrl: 'https://media.formula1.com/image/upload/c_lfill,h_224/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaccarright.webp',
    logoImageUrl: 'https://media.formula1.com/image/upload/c_lfill,w_120/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaclogowhite.webp',
  },
};

// Aliases mapping for various API constructor IDs and historic/sponsor names
const CONSTRUCTOR_ALIASES: Record<string, string> = {
  audi: 'sauber',
  audi_f1: 'sauber',
  kick_sauber: 'sauber',
  kick: 'sauber',
  stake: 'sauber',
  stake_f1_team_kick_sauber: 'sauber',
  alfa: 'sauber',
  alfa_romeo: 'sauber',
  rb: 'rb',
  racing_bulls: 'rb',
  visa_cash_app_rb: 'rb',
  alphatauri: 'rb',
  toro_rosso: 'rb',
  haas_f1_team: 'haas',
  haas: 'haas',
  alpine_f1_team: 'alpine',
  alpine: 'alpine',
  aston_martin_f1_team: 'aston_martin',
  aston_martin_aramco: 'aston_martin',
  aston_martin: 'aston_martin',
  racing_point: 'aston_martin',
  force_india: 'aston_martin',
  williams_racing: 'williams',
  williams_f1_team: 'williams',
  williams: 'williams',
  redbull: 'red_bull',
  red_bull_racing: 'red_bull',
  scuderia_ferrari: 'ferrari',
  scuderia_ferrari_hp: 'ferrari',
  mclaren_f1_team: 'mclaren',
  mercedes_amg: 'mercedes',
  cadillac_f1_team: 'cadillac',
};

export function getTeamMeta(constructorIdOrName: string): TeamMeta {
  if (!constructorIdOrName) return F1_TEAMS.ferrari;
  const rawKey = constructorIdOrName.toLowerCase().trim();
  const normalizedKey = rawKey.replace(/[\s-]+/g, '_');
  
  // 1. Direct match in alias map
  if (CONSTRUCTOR_ALIASES[normalizedKey] && F1_TEAMS[CONSTRUCTOR_ALIASES[normalizedKey]]) {
    return F1_TEAMS[CONSTRUCTOR_ALIASES[normalizedKey]];
  }

  // 2. Direct match in F1_TEAMS keys
  if (F1_TEAMS[normalizedKey]) return F1_TEAMS[normalizedKey];

  // 3. Fuzzy matching across keys, names, and full names
  for (const [id, team] of Object.entries(F1_TEAMS)) {
    const tName = team.name.toLowerCase();
    const fName = team.fullName.toLowerCase();
    if (
      normalizedKey.includes(id) ||
      id.includes(normalizedKey) ||
      tName.includes(normalizedKey) ||
      normalizedKey.includes(tName) ||
      fName.includes(normalizedKey) ||
      normalizedKey.includes(fName) ||
      (normalizedKey.includes('audi') && (id === 'sauber' || team.name.toLowerCase().includes('sauber'))) ||
      (normalizedKey.includes('kick') && (id === 'sauber' || team.name.toLowerCase().includes('sauber'))) ||
      (normalizedKey.includes('stake') && (id === 'sauber' || team.name.toLowerCase().includes('sauber')))
    ) {
      return team;
    }
  }

  // Fallback default neutral cyan/racing accent
  return {
    id: normalizedKey,
    name: constructorIdOrName,
    fullName: constructorIdOrName,
    color: '#E10600',
    secondaryColor: '#FFFFFF',
    textColor: '#FFFFFF',
    accentGlow: 'rgba(225, 6, 0, 0.4)',
    powerUnit: 'Formula 1',
    base: 'Unknown',
    teamPrincipal: 'Team Principal',
    championships: 0,
    drivers: [],
  };
}

export const DRIVER_DETAILS: Record<
  string,
  {
    number: number;
    code: string;
    teamId: string;
    countryCode: string;
    countryFlag: string;
    birthDate: string;
    bio: string;
    worldTitles: number;
  }
> = {
  max_verstappen: {
    number: 1,
    code: 'VER',
    teamId: 'red_bull',
    countryCode: 'NLD',
    countryFlag: '🇳🇱',
    birthDate: '1997-09-30',
    bio: 'Multi-time World Champion known for relentless racecraft and unparalleled precision.',
    worldTitles: 4,
  },
  norris: {
    number: 4,
    code: 'NOR',
    teamId: 'mclaren',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    birthDate: '1999-11-13',
    bio: 'McLaren talisman with explosive qualifying pace and championship-grade racecraft.',
    worldTitles: 0,
  },
  leclerc: {
    number: 16,
    code: 'LEC',
    teamId: 'ferrari',
    countryCode: 'MCO',
    countryFlag: '🇲🇨',
    birthDate: '1997-10-16',
    bio: 'Monegasque sensation, master of one-lap qualifying magic and Ferrari heartthrob.',
    worldTitles: 0,
  },
  hamilton: {
    number: 44,
    code: 'HAM',
    teamId: 'ferrari',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    birthDate: '1985-01-07',
    bio: '7-time World Champion, statistically the greatest driver in F1 history in his iconic Ferrari era.',
    worldTitles: 7,
  },
  piastri: {
    number: 81,
    code: 'PIA',
    teamId: 'mclaren',
    countryCode: 'AUS',
    countryFlag: '🇦🇺',
    birthDate: '2001-04-06',
    bio: 'Ice-cool Australian prodigy with ruthless composure and Grand Prix winning racecraft.',
    worldTitles: 0,
  },
  russell: {
    number: 63,
    code: 'RUS',
    teamId: 'mercedes',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    birthDate: '1998-02-15',
    bio: 'Mercedes team leader with clinical precision, relentless determination, and pole mastery.',
    worldTitles: 0,
  },
  sainz: {
    number: 55,
    code: 'SAI',
    teamId: 'williams',
    countryCode: 'ESP',
    countryFlag: '🇪🇸',
    birthDate: '1994-09-01',
    bio: 'The Smooth Operator — tactical genius with race-winning strategy intuition.',
    worldTitles: 0,
  },
  alonso: {
    number: 14,
    code: 'ALO',
    teamId: 'aston_martin',
    countryCode: 'ESP',
    countryFlag: '🇪🇸',
    birthDate: '1981-07-29',
    bio: 'Two-time World Champion, ageless gladiator who outfoxes competitors on every lap.',
    worldTitles: 2,
  },
  albon: {
    number: 23,
    code: 'ALB',
    teamId: 'williams',
    countryCode: 'THA',
    countryFlag: '🇹🇭',
    birthDate: '1996-03-23',
    bio: 'Williams anchor, renowned for tire conservation and extraordinary defensive drives.',
    worldTitles: 0,
  },
  gasly: {
    number: 10,
    code: 'GAS',
    teamId: 'alpine',
    countryCode: 'FRA',
    countryFlag: '🇫🇷',
    birthDate: '1996-02-07',
    bio: 'Grand Prix winner with fiery racecraft and relentless tenacity for Alpine.',
    worldTitles: 0,
  },
  tsunoda: {
    number: 22,
    code: 'TSU',
    teamId: 'rb',
    countryCode: 'JPN',
    countryFlag: '🇯🇵',
    birthDate: '2000-05-11',
    bio: 'Fast, passionate fan favorite with blisteringly quick reflexes on the track.',
    worldTitles: 0,
  },
  hulkenberg: {
    number: 27,
    code: 'HUL',
    teamId: 'sauber',
    countryCode: 'DEU',
    countryFlag: '🇩🇪',
    birthDate: '1987-08-19',
    bio: 'Veteran qualifying specialist known for extracting every tenth from any chassis.',
    worldTitles: 0,
  },
  bearman: {
    number: 87,
    code: 'BEA',
    teamId: 'haas',
    countryCode: 'GBR',
    countryFlag: '🇬🇧',
    birthDate: '2005-05-08',
    bio: 'Young British dynamo who took the paddock by storm with an unforgettable rookie debut.',
    worldTitles: 0,
  },
  ocon: {
    number: 31,
    code: 'OCO',
    teamId: 'haas',
    countryCode: 'FRA',
    countryFlag: '🇫🇷',
    birthDate: '1996-09-17',
    bio: 'Grand Prix winner known as one of the fiercest wheel-to-wheel racers on the grid.',
    worldTitles: 0,
  },
  stroll: {
    number: 18,
    code: 'STR',
    teamId: 'aston_martin',
    countryCode: 'CAN',
    countryFlag: '🇨🇦',
    birthDate: '1998-10-29',
    bio: 'Podium finisher and wet-weather virtuoso for Aston Martin.',
    worldTitles: 0,
  },
};

export const CIRCUIT_EXTRAS: Record<
  string,
  {
    corners: number;
    drsZones: number;
    lengthKm: number;
    lapRecord: string;
    recordHolder: string;
    recordYear: string;
  }
> = {
  albert_park: {
    corners: 14,
    drsZones: 4,
    lengthKm: 5.278,
    lapRecord: '1:19.813',
    recordHolder: 'Charles Leclerc',
    recordYear: '2024',
  },
  australia: {
    corners: 14,
    drsZones: 4,
    lengthKm: 5.278,
    lapRecord: '1:19.813',
    recordHolder: 'Charles Leclerc',
    recordYear: '2024',
  },
  bahrain: {
    corners: 15,
    drsZones: 3,
    lengthKm: 5.412,
    lapRecord: '1:31.447',
    recordHolder: 'Pedro de la Rosa',
    recordYear: '2005',
  },
  shanghai: {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.451,
    lapRecord: '1:32.238',
    recordHolder: 'Michael Schumacher',
    recordYear: '2004',
  },
  china: {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.451,
    lapRecord: '1:32.238',
    recordHolder: 'Michael Schumacher',
    recordYear: '2004',
  },
  suzuka: {
    corners: 18,
    drsZones: 1,
    lengthKm: 5.807,
    lapRecord: '1:30.965',
    recordHolder: 'Kimi Antonelli',
    recordYear: '2025',
  },
  japan: {
    corners: 18,
    drsZones: 1,
    lengthKm: 5.807,
    lapRecord: '1:30.965',
    recordHolder: 'Kimi Antonelli',
    recordYear: '2025',
  },
  miami: {
    corners: 19,
    drsZones: 3,
    lengthKm: 5.412,
    lapRecord: '1:29.708',
    recordHolder: 'Max Verstappen',
    recordYear: '2023',
  },
  villeneuve: {
    corners: 14,
    drsZones: 3,
    lengthKm: 4.361,
    lapRecord: '1:13.078',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2019',
  },
  canada: {
    corners: 14,
    drsZones: 3,
    lengthKm: 4.361,
    lapRecord: '1:13.078',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2019',
  },
  monaco: {
    corners: 19,
    drsZones: 1,
    lengthKm: 3.337,
    lapRecord: '1:12.909',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2021',
  },
  catalunya: {
    corners: 14,
    drsZones: 2,
    lengthKm: 5.414,
    lapRecord: '1:35.587',
    recordHolder: 'George Russell',
    recordYear: '2026',
  },
  spain: {
    corners: 14,
    drsZones: 2,
    lengthKm: 5.414,
    lapRecord: '1:35.587',
    recordHolder: 'George Russell',
    recordYear: '2026',
  },
  red_bull_ring: {
    corners: 10,
    drsZones: 3,
    lengthKm: 4.326,
    lapRecord: '1:07.924',
    recordHolder: 'Oscar Piastri',
    recordYear: '2025',
  },
  austria: {
    corners: 10,
    drsZones: 3,
    lengthKm: 4.326,
    lapRecord: '1:07.924',
    recordHolder: 'Oscar Piastri',
    recordYear: '2025',
  },
  silverstone: {
    corners: 18,
    drsZones: 2,
    lengthKm: 5.891,
    lapRecord: '1:27.097',
    recordHolder: 'Max Verstappen',
    recordYear: '2020',
  },
  great_britain: {
    corners: 18,
    drsZones: 2,
    lengthKm: 5.891,
    lapRecord: '1:27.097',
    recordHolder: 'Max Verstappen',
    recordYear: '2020',
  },
  hungaroring: {
    corners: 14,
    drsZones: 2,
    lengthKm: 4.381,
    lapRecord: '1:16.627',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2020',
  },
  hungary: {
    corners: 14,
    drsZones: 2,
    lengthKm: 4.381,
    lapRecord: '1:16.627',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2020',
  },
  spa: {
    corners: 19,
    drsZones: 2,
    lengthKm: 7.004,
    lapRecord: '1:44.701',
    recordHolder: 'Sergio Perez',
    recordYear: '2024',
  },
  belgium: {
    corners: 19,
    drsZones: 2,
    lengthKm: 7.004,
    lapRecord: '1:44.701',
    recordHolder: 'Sergio Perez',
    recordYear: '2024',
  },
  zandvoort: {
    corners: 14,
    drsZones: 2,
    lengthKm: 4.259,
    lapRecord: '1:11.097',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2021',
  },
  netherlands: {
    corners: 14,
    drsZones: 2,
    lengthKm: 4.259,
    lapRecord: '1:11.097',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2021',
  },
  monza: {
    corners: 11,
    drsZones: 2,
    lengthKm: 5.793,
    lapRecord: '1:20.901',
    recordHolder: 'Lando Norris',
    recordYear: '2025',
  },
  italy: {
    corners: 11,
    drsZones: 2,
    lengthKm: 5.793,
    lapRecord: '1:20.901',
    recordHolder: 'Lando Norris',
    recordYear: '2025',
  },
  baku: {
    corners: 20,
    drsZones: 2,
    lengthKm: 6.003,
    lapRecord: '1:43.009',
    recordHolder: 'Charles Leclerc',
    recordYear: '2019',
  },
  azerbaijan: {
    corners: 20,
    drsZones: 2,
    lengthKm: 6.003,
    lapRecord: '1:43.009',
    recordHolder: 'Charles Leclerc',
    recordYear: '2019',
  },
  marina_bay: {
    corners: 19,
    drsZones: 4,
    lengthKm: 4.927,
    lapRecord: '1:33.808',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2025',
  },
  singapore: {
    corners: 19,
    drsZones: 4,
    lengthKm: 4.927,
    lapRecord: '1:33.808',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2025',
  },
  americas: {
    corners: 20,
    drsZones: 2,
    lengthKm: 5.513,
    lapRecord: '1:36.169',
    recordHolder: 'Charles Leclerc',
    recordYear: '2019',
  },
  united_states: {
    corners: 20,
    drsZones: 2,
    lengthKm: 5.513,
    lapRecord: '1:36.169',
    recordHolder: 'Charles Leclerc',
    recordYear: '2019',
  },
  rodriguez: {
    corners: 17,
    drsZones: 3,
    lengthKm: 4.304,
    lapRecord: '1:17.774',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2021',
  },
  mexico: {
    corners: 17,
    drsZones: 3,
    lengthKm: 4.304,
    lapRecord: '1:17.774',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2021',
  },
  interlagos: {
    corners: 15,
    drsZones: 2,
    lengthKm: 4.309,
    lapRecord: '1:10.540',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2018',
  },
  brazil: {
    corners: 15,
    drsZones: 2,
    lengthKm: 4.309,
    lapRecord: '1:10.540',
    recordHolder: 'Valtteri Bottas',
    recordYear: '2018',
  },
  vegas: {
    corners: 17,
    drsZones: 2,
    lengthKm: 6.201,
    lapRecord: '1:33.365',
    recordHolder: 'Max Verstappen',
    recordYear: '2025',
  },
  las_vegas: {
    corners: 17,
    drsZones: 2,
    lengthKm: 6.201,
    lapRecord: '1:33.365',
    recordHolder: 'Max Verstappen',
    recordYear: '2025',
  },
  losail: {
    corners: 16,
    drsZones: 1,
    lengthKm: 5.419,
    lapRecord: '1:22.384',
    recordHolder: 'Lando Norris',
    recordYear: '2024',
  },
  qatar: {
    corners: 16,
    drsZones: 1,
    lengthKm: 5.419,
    lapRecord: '1:22.384',
    recordHolder: 'Lando Norris',
    recordYear: '2024',
  },
  yas_marina: {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.281,
    lapRecord: '1:26.103',
    recordHolder: 'Max Verstappen',
    recordYear: '2021',
  },
  abu_dhabi: {
    corners: 16,
    drsZones: 2,
    lengthKm: 5.281,
    lapRecord: '1:26.103',
    recordHolder: 'Max Verstappen',
    recordYear: '2021',
  },
  jeddah: {
    corners: 27,
    drsZones: 3,
    lengthKm: 6.174,
    lapRecord: '1:30.734',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2021',
  },
  saudi_arabia: {
    corners: 27,
    drsZones: 3,
    lengthKm: 6.174,
    lapRecord: '1:30.734',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2021',
  },
  imola: {
    corners: 19,
    drsZones: 1,
    lengthKm: 4.909,
    lapRecord: '1:15.484',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2020',
  },
  emilia_romagna: {
    corners: 19,
    drsZones: 1,
    lengthKm: 4.909,
    lapRecord: '1:15.484',
    recordHolder: 'Lewis Hamilton',
    recordYear: '2020',
  },
};

export function getNationalityFlag(nationalityOrCountry: string | undefined | null): string {
  if (!nationalityOrCountry) return '🏁';
  const norm = nationalityOrCountry.toLowerCase().trim();

  if (norm.includes('monaco') || norm.includes('monegasque') || norm === 'mco') return '🇲🇨';
  if (norm.includes('dutch') || norm.includes('netherlands') || norm === 'nld' || norm === 'ned') return '🇳🇱';
  if (norm.includes('british') || norm.includes('united kingdom') || norm.includes('uk') || norm === 'gbr') return '🇬🇧';
  if (norm.includes('italian') || norm.includes('italy') || norm === 'ita') return '🇮🇹';
  if (norm.includes('spanish') || norm.includes('spain') || norm === 'esp') return '🇪🇸';
  if (norm.includes('australian') || norm.includes('australia') || norm === 'aus') return '🇦🇺';
  if (norm.includes('french') || norm.includes('france') || norm === 'fra') return '🇫🇷';
  if (norm.includes('german') || norm.includes('germany') || norm === 'deu' || norm === 'ger') return '🇩🇪';
  if (norm.includes('japanese') || norm.includes('japan') || norm === 'jpn') return '🇯🇵';
  if (norm.includes('mexican') || norm.includes('mexico') || norm === 'mex') return '🇲🇽';
  if (norm.includes('canadian') || norm.includes('canada') || norm === 'can') return '🇨🇦';
  if (norm.includes('thai') || norm.includes('thailand') || norm === 'tha') return '🇹🇭';
  if (norm.includes('american') || norm.includes('usa') || norm.includes('united states')) return '🇺🇸';
  if (norm.includes('argentine') || norm.includes('argentina') || norm === 'arg') return '🇦🇷';
  if (norm.includes('brazilian') || norm.includes('brazil') || norm === 'bra') return '🇧🇷';
  if (norm.includes('finnish') || norm.includes('finland') || norm === 'fin') return '🇫🇮';
  if (norm.includes('danish') || norm.includes('denmark') || norm === 'dnk' || norm === 'den') return '🇩🇰';
  if (norm.includes('chinese') || norm.includes('china') || norm === 'chn') return '🇨🇳';
  if (norm.includes('zealand') || norm === 'nzl') return '🇳🇿';
  if (norm.includes('swiss') || norm.includes('switzerland') || norm === 'sui' || norm === 'che') return '🇨🇭';
  if (norm.includes('austrian') || norm.includes('austria') || norm === 'aut') return '🇦🇹';
  if (norm.includes('belgian') || norm.includes('belgium') || norm === 'bel') return '🇧🇪';

  return '🏁';
}

export const OFFICIAL_DRIVER_IMAGES: Record<string, string> = {
  // F1 Drivers
  max_verstappen: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',
  verstappen: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',
  ver: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/maxver01/2026redbullracingmaxver01right.webp',

  lewis_hamilton: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',
  hamilton: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',
  ham: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/lewham01/2026ferrarilewham01right.webp',

  charles_leclerc: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',
  leclerc: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',
  lec: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/ferrari/chalec01/2026ferrarichalec01right.webp',

  lando_norris: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',
  norris: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',
  nor: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/lannor01/2026mclarenlannor01right.webp',

  oscar_piastri: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',
  piastri: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',
  pia: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mclaren/oscpia01/2026mclarenoscpia01right.webp',

  george_russell: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',
  russell: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',
  rus: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/georus01/2026mercedesgeorus01right.webp',

  kimi_antonelli: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',
  antonelli: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',
  ant: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/mercedes/andant01/2026mercedesandant01right.webp',

  carlos_sainz: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  sainz: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',
  sai: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/carsai01/2026williamscarsai01right.webp',

  alexander_albon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
  albon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',
  alb: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/williams/alealb01/2026williamsalealb01right.webp',

  fernando_alonso: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
  alonso: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',
  alo: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/feralo01/2026astonmartinferalo01right.webp',

  lance_stroll: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
  stroll: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',
  str: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/astonmartin/lanstr01/2026astonmartinlanstr01right.webp',

  pierre_gasly: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',
  gasly: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',
  gas: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/piegas01/2026alpinepiegas01right.webp',

  franco_colapinto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',
  colapinto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',
  col: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/alpine/fracol01/2026alpinefracol01right.webp',

  esteban_ocon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp',
  ocon: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp',
  oco: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/estoco01/2026haasf1teamestoco01right.webp',

  oliver_bearman: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp',
  bearman: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp',
  bea: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/haasf1team/olibea01/2026haasf1teamolibea01right.webp',

  nico_hulkenberg: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  hulkenberg: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',
  hul: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/nichul01/2026audinichul01right.webp',

  gabriel_bortoleto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
  bortoleto: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',
  bor: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/audi/gabbor01/2026audigabbor01right.webp',

  liam_lawson: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',
  lawson: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',
  law: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/lialaw01/2026racingbullslialaw01right.webp',

  isack_hadjar: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',
  hadjar: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',
  had: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/redbullracing/isahad01/2026redbullracingisahad01right.webp',

  arvid_lindblad: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',
  lindblad: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',
  lin: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/arvlin01/2026racingbullsarvlin01right.webp',

  sergio_perez: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  perez: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',
  per: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/serper01/2026cadillacserper01right.webp',

  valtteri_bottas: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
  bottas: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',
  bot: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/cadillac/valbot01/2026cadillacvalbot01right.webp',

  yuki_tsunoda: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/yuktsu01/2026racingbullsyuktsu01right.webp',
  tsunoda: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/yuktsu01/2026racingbullsyuktsu01right.webp',
  tsu: 'https://media.formula1.com/image/upload/c_lfill,w_440/q_auto/v1740000001/common/f1/2026/racingbulls/yuktsu01/2026racingbullsyuktsu01right.webp',
};

export function getDriverHeadshot(driverIdOrCode: string): string {
  if (!driverIdOrCode) return '';
  const key = driverIdOrCode.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (OFFICIAL_DRIVER_IMAGES[key]) {
    return OFFICIAL_DRIVER_IMAGES[key];
  }
  for (const [k, url] of Object.entries(OFFICIAL_DRIVER_IMAGES)) {
    if (key.includes(k) || k.includes(key)) {
      return url;
    }
  }
  return '';
}

