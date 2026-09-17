export interface JuniorDriver {
  id: string;
  name: string;
  code: string;
  number: number;
  country: string;
  countryFlag: string;
  team: string;
  f1Academy?: string;
  f1AcademyColor?: string;
  points: number;
  position: number;
  wins: number;
  podiums: number;
  poles: number;
  headshotUrl?: string;
  bio?: string;
}

export interface JuniorTeam {
  name: string;
  points: number;
  position: number;
  color: string;
  base?: string;
}

export interface JuniorRaceWeekend {
  round: number;
  gpName: string;
  circuit: string;
  countryFlag: string;
  date: string;
  isCompleted: boolean;
  sprintWinner?: string;
  featureWinner?: string;
  polePosition?: string;
  fastestLap?: string;
}

export interface JuniorCarSpecs {
  model: string;
  chassis: string;
  engine: string;
  power: string;
  topSpeed: string;
  acceleration: string;
  gearbox: string;
  weight: string;
  tyres: string;
  fuel: string;
}

export interface JuniorSeriesData {
  seriesId: 'f2' | 'f3' | 'academy';
  seriesName: string;
  championshipYear: string;
  description: string;
  regulations: string;
  carSpecs: JuniorCarSpecs;
  drivers: JuniorDriver[];
  teams: JuniorTeam[];
  calendar: JuniorRaceWeekend[];
}

export const JUNIOR_SERIES_DATABASE: Record<'f2' | 'f3' | 'academy', JuniorSeriesData> = {
  f2: {
    seriesId: 'f2',
    seriesName: 'FIA Formula 2 Championship',
    championshipYear: '2026',
    description: 'Premier single-spec feeder championship directly below Formula 1. Powered by Mecachrome 3.4L V6 Turbo engines with 100% Aramco sustainable fuel.',
    regulations: 'Sprint Race (Reverse top 10, 10-1 pts) & Feature Race (Mandatory pit stop, 25-1 pts). 2 pts for Pole Position, 1 pt for Fastest Lap.',
    carSpecs: {
      model: 'Dallara F2 2024 Chassis',
      chassis: 'Carbon-fibre monocoque with FIA Halo 3D safety structure & ground-effect floor',
      engine: 'Mecachrome 3.4L Single Turbocharged V6 Engine',
      power: '620 HP @ 8,750 RPM (Maximum Torque: 570 Nm @ 6,000 RPM)',
      topSpeed: '335 km/h (208 mph) with DRS open at Monza / Baku',
      acceleration: '0–100 km/h in 2.85 seconds; 0–200 km/h in 6.60 seconds',
      gearbox: 'Hewland 6-speed longitudinal paddle-shift electro-hydraulic sequential',
      weight: '795 kg (minimum weight including driver and ballast)',
      tyres: 'Pirelli P Zero 18-inch slick compounds (Hard, Medium, Soft, SuperSoft & Wet)',
      fuel: '100% Aramco Advanced Synthetic Sustainable Fuel',
    },
    drivers: [
      { id: 'miyata', name: 'Ritomo Miyata', code: 'MIY', number: 3, country: 'Japan', countryFlag: '🇯🇵', team: 'Hitech Pulse-Eight', f1Academy: 'Toyota Gazoo Racing', f1AcademyColor: '#E8002D', points: 154, position: 1, wins: 4, podiums: 7, poles: 2, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/hitech/ritmiy01/2026hitechritmiy01right.webp', bio: 'Super Formula and Super GT Champion who made an explosive transition to European racing with Hitech.' },
      { id: 'herta', name: 'Colton Herta', code: 'HER', number: 4, country: 'United States', countryFlag: '🇺🇸', team: 'Hitech Pulse-Eight', f1Academy: 'Cadillac F1 Target', f1AcademyColor: '#FFC72C', points: 142, position: 2, wins: 3, podiums: 6, poles: 3, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/hitech/colher01/2026hitechcolher01right.webp', bio: 'IndyCar superstar and youngest winner in IndyCar history, competing in FIA F2 to earn F1 Super Licence points.' },
      { id: 'beganovic', name: 'Dino Beganovic', code: 'BEG', number: 1, country: 'Sweden', countryFlag: '🇸🇪', team: 'DAMS Lucas Oil', f1Academy: 'Ferrari Driver Academy', f1AcademyColor: '#E8002D', points: 138, position: 3, wins: 2, podiums: 6, poles: 2, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/damslucasoil/dinbeg01/2026damslucasoildinbeg01right.webp', bio: 'FRECA Champion and Ferrari Driver Academy protege stepping up to F2 with DAMS.' },
      { id: 'durksen', name: 'Joshua Dürksen', code: 'DUR', number: 24, country: 'Paraguay', countryFlag: '🇵🇾', team: 'PHM AIX Racing', f1Academy: 'Independent Sensation', f1AcademyColor: '#3671C6', points: 112, position: 4, wins: 2, podiums: 4, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/invictaracing/csdur01/2026invictaracingcsdur01right.webp', bio: 'Paraguayan trailblazer who captured historic F2 Feature Race victory at Baku.' },
      { id: 'leon', name: 'Noel León', code: 'LEO', number: 14, country: 'Mexico', countryFlag: '🇲🇽', team: 'Campos Racing', f1Academy: 'Red Bull Junior Team', f1AcademyColor: '#3671C6', points: 98, position: 5, wins: 1, podiums: 5, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/camposracing/noeleo01/2026camposracingnoeleo01right.webp', bio: 'Euroformula Champion and Red Bull Junior driver impressing with Campos Racing.' },
      { id: 'aron', name: 'Paul Aron', code: 'ARO', number: 17, country: 'Estonia', countryFlag: '🇪🇪', team: 'Hitech Pulse-Eight', f1Academy: 'Alpine Academy', f1AcademyColor: '#0090FF', points: 95, position: 6, wins: 1, podiums: 4, poles: 2, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/hitech/pauaro01/2026hitechpauaro01right.webp', bio: 'Estonian qualifying specialist known for supreme consistency on street tracks.' },
      { id: 'martins', name: 'Victor Martins', code: 'MAR', number: 7, country: 'France', countryFlag: '🇫🇷', team: 'ART Grand Prix', f1Academy: 'Alpine Academy', f1AcademyColor: '#0090FF', points: 88, position: 7, wins: 2, podiums: 4, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/artgrandprix/vicmar01/2026artgrandprixvicmar01right.webp', bio: 'Formula 3 Champion and Alpine Academy leader with blistering one-lap qualifying pace.' },
      { id: 'crawford', name: 'Jak Crawford', code: 'CRA', number: 8, country: 'United States', countryFlag: '🇺🇸', team: 'DAMS Lucas Oil', f1Academy: 'Aston Martin Driver Development', f1AcademyColor: '#229971', points: 84, position: 8, wins: 1, podiums: 4, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/damslucasoil/jakcra01/2026damslucasoiljakcra01right.webp', bio: 'Aston Martin Young Driver Team ambassador with victories at Barcelona and Red Bull Ring.' },
      { id: 'browning', name: 'Luke Browning', code: 'BRO', number: 2, country: 'United Kingdom', countryFlag: '🇬🇧', team: 'ART Grand Prix', f1Academy: 'Williams Racing Driver Academy', f1AcademyColor: '#64C4FF', points: 76, position: 9, wins: 1, podiums: 3, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/artgrandprix/lukbro01/2026artgrandprixlukbro01right.webp', bio: 'Macau Grand Prix winner and Williams Driver Academy prospect.' },
      { id: 'bilinski', name: 'Roman Bilinski', code: 'BIL', number: 21, country: 'Poland', countryFlag: '🇵🇱', team: 'Rodin Motorsport', f1Academy: 'FR Oceania Champion', f1AcademyColor: '#FF8000', points: 64, position: 10, wins: 1, podiums: 2, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f2/2026/damslucasoil/rombil01/2026damslucasoilrombil01right.webp', bio: 'Formula Regional Oceania Champion who established himself as a Feature Race contender.' },
    ],
    teams: [
      { name: 'Hitech Pulse-Eight', points: 296, position: 1, color: '#002F6C', base: 'Silverstone, United Kingdom' },
      { name: 'DAMS Lucas Oil', points: 222, position: 2, color: '#00A0DE', base: 'Le Mans, France' },
      { name: 'Campos Racing', points: 184, position: 3, color: '#E8002D', base: 'Alzira, Spain' },
      { name: 'ART Grand Prix', points: 164, position: 4, color: '#FFFFFF', base: 'Villeneuve-la-Guyard, France' },
      { name: 'PHM AIX Racing', points: 132, position: 5, color: '#3671C6', base: 'Nurburgring, Germany' },
      { name: 'Rodin Motorsport', points: 118, position: 6, color: '#FF8000', base: 'Farnham, United Kingdom' },
      { name: 'Invicta Racing', points: 106, position: 7, color: '#FCD800', base: 'Attleborough, United Kingdom' },
      { name: 'MP Motorsport', points: 94, position: 8, color: '#FF4500', base: 'Westmaas, Netherlands' },
      { name: 'PREMA Racing', points: 88, position: 9, color: '#E8002D', base: 'Grisignano di Zocco, Italy' },
      { name: 'Van Amersfoort Racing', points: 72, position: 10, color: '#FF8000', base: 'Zeewolde, Netherlands' },
    ],
    calendar: [
      { round: 1, gpName: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', countryFlag: '🇧🇭', date: '28 FEB – 02 MAR', isCompleted: true, sprintWinner: 'Ritomo Miyata', featureWinner: 'Colton Herta', polePosition: 'Colton Herta', fastestLap: 'Ritomo Miyata' },
      { round: 2, gpName: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit', countryFlag: '🇸🇦', date: '07 MAR – 09 MAR', isCompleted: true, sprintWinner: 'Victor Martins', featureWinner: 'Dino Beganovic', polePosition: 'Dino Beganovic', fastestLap: 'Victor Martins' },
      { round: 3, gpName: 'Australian Grand Prix', circuit: 'Albert Park Circuit', countryFlag: '🇦🇺', date: '22 MAR – 24 MAR', isCompleted: true, sprintWinner: 'Joshua Dürksen', featureWinner: 'Ritomo Miyata', polePosition: 'Ritomo Miyata', fastestLap: 'Colton Herta' },
      { round: 4, gpName: 'Emilia Romagna Grand Prix', circuit: 'Autodromo Enzo e Dino Ferrari', countryFlag: '🇮🇹', date: '17 MAY – 19 MAY', isCompleted: true, sprintWinner: 'Noel León', featureWinner: 'Jak Crawford', polePosition: 'Paul Aron', fastestLap: 'Noel León' },
      { round: 5, gpName: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', countryFlag: '🇲🇨', date: '24 MAY – 26 MAY', isCompleted: true, sprintWinner: 'Luke Browning', featureWinner: 'Colton Herta', polePosition: 'Colton Herta', fastestLap: 'Colton Herta' },
      { round: 6, gpName: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', countryFlag: '🇪🇸', date: '21 JUN – 23 JUN', isCompleted: true, sprintWinner: 'Paul Aron', featureWinner: 'Ritomo Miyata', polePosition: 'Paul Aron', fastestLap: 'Ritomo Miyata' },
      { round: 7, gpName: 'Austrian Grand Prix', circuit: 'Red Bull Ring', countryFlag: '🇦🇹', date: '28 JUN – 30 JUN', isCompleted: true, sprintWinner: 'Roman Bilinski', featureWinner: 'Dino Beganovic', polePosition: 'Dino Beganovic', fastestLap: 'Dino Beganovic' },
      { round: 8, gpName: 'British Grand Prix', circuit: 'Silverstone Circuit', countryFlag: '🇬🇧', date: '05 JUL – 07 JUL', isCompleted: true, sprintWinner: 'Jak Crawford', featureWinner: 'Victor Martins', polePosition: 'Victor Martins', fastestLap: 'Luke Browning' },
      { round: 9, gpName: 'Hungarian Grand Prix', circuit: 'Hungaroring', countryFlag: '🇭🇺', date: '19 JUL – 21 JUL', isCompleted: true, sprintWinner: 'Ritomo Miyata', featureWinner: 'Noel León', polePosition: 'Ritomo Miyata', fastestLap: 'Ritomo Miyata' },
      { round: 10, gpName: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', countryFlag: '🇧🇪', date: '26 JUL – 28 JUL', isCompleted: true, sprintWinner: 'Dino Beganovic', featureWinner: 'Colton Herta', polePosition: 'Colton Herta', fastestLap: 'Paul Aron' },
      { round: 11, gpName: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', countryFlag: '🇳🇱', date: '23 AUG – 25 AUG', isCompleted: true, sprintWinner: 'Victor Martins', featureWinner: 'Ritomo Miyata', polePosition: 'Ritomo Miyata', fastestLap: 'Ritomo Miyata' },
      { round: 12, gpName: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', countryFlag: '🇮🇹', date: '30 AUG – 01 SEP', isCompleted: true, sprintWinner: 'Joshua Dürksen', featureWinner: 'Jak Crawford', polePosition: 'Jak Crawford', fastestLap: 'Joshua Dürksen' },
      { round: 13, gpName: 'Azerbaijan Grand Prix', circuit: 'Baku City Circuit', countryFlag: '🇦🇿', date: '13 SEP – 15 SEP', isCompleted: false },
      { round: 14, gpName: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', countryFlag: '🇦🇪', date: '06 DEC – 08 DEC', isCompleted: false },
    ],
  },
  f3: {
    seriesId: 'f3',
    seriesName: 'FIA Formula 3 Championship',
    championshipYear: '2026',
    description: 'Ultra-competitive 30-car junior proving ground for future F1 superstars. Equal Mecachrome 3.4L V6 engines with intense wheel-to-wheel Sprint & Feature racing.',
    regulations: 'Sprint Race (Reverse top 12 grid, 10-1 pts) & Feature Race (25-1 pts). 2 pts for Pole Position, 1 pt for Fastest Lap in top 10.',
    carSpecs: {
      model: 'Dallara F3 2025 Next-Gen Chassis',
      chassis: 'Carbon-composite monocoque with FIA 2025 impact structures & anti-wheel-climb nose',
      engine: 'Mecachrome 3.4L Naturally Aspirated V6 Engine',
      power: '380 HP @ 8,000 RPM',
      topSpeed: '300 km/h (186 mph) with DRS open',
      acceleration: '0–100 km/h in 3.0 seconds; 0–200 km/h in 7.7 seconds',
      gearbox: 'Hewland 6-speed longitudinal paddle-shift sequential gearbox',
      weight: '690 kg (minimum weight including driver)',
      tyres: 'Pirelli 13-inch bespoke Formula 3 compounds',
      fuel: '100% Aramco Sustainable Synthetic Racing Fuel',
    },
    drivers: [
      { id: 'slater', name: 'Freddie Slater', code: 'SLA', number: 2, country: 'United Kingdom', countryFlag: '🇬🇧', team: 'Trident', f1Academy: 'Red Bull Junior Team', f1AcademyColor: '#3671C6', points: 145, position: 1, wins: 4, podiums: 7, poles: 3, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/trident/fresla01/2026tridentfresla01right.webp', bio: 'Italian F4 champion and karting legend who took the F3 championship by storm with Trident.' },
      { id: 'taponen', name: 'Tuukka Taponen', code: 'TAP', number: 3, country: 'Finland', countryFlag: '🇫🇮', team: 'MP Motorsport', f1Academy: 'Ferrari Driver Academy', f1AcademyColor: '#E8002D', points: 109, position: 2, wins: 3, podiums: 5, poles: 2, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/mpmotorsport/tuatap01/2026mpmotorsporttuatap01right.webp', bio: 'Finnish flying sensation and Ferrari protege with wins at Spa and Red Bull Ring.' },
      { id: 'ugochukwu', name: 'Ugo Ugochukwu', code: 'UGO', number: 1, country: 'United States', countryFlag: '🇺🇸', team: 'Trident', f1Academy: 'McLaren Driver Development', f1AcademyColor: '#FF8000', points: 102, position: 3, wins: 2, podiums: 5, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/trident/ugougo01/2026tridentugougo01right.webp', bio: 'Macau Grand Prix winner and McLaren Young Driver prodigy.' },
      { id: 'camara', name: 'Rafael Câmara', code: 'CAM', number: 4, country: 'Brazil', countryFlag: '🇧🇷', team: 'Trident', f1Academy: 'Ferrari Driver Academy', f1AcademyColor: '#E8002D', points: 94, position: 4, wins: 2, podiums: 4, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/trident/rafcam01/2026tridentrafcam01right.webp', bio: 'FRECA Champion and Brazilian Ferrari Academy sensation.' },
      { id: 'boya', name: 'Mari Boya', code: 'BOY', number: 10, country: 'Spain', countryFlag: '🇪🇸', team: 'Campos Racing', f1Academy: 'Aston Martin Driver Development', f1AcademyColor: '#229971', points: 88, position: 5, wins: 1, podiums: 4, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/camposracing/marboy01/2026camposracingmarboy01right.webp', bio: 'Spanish Feature Race winner with Campos Racing.' },
      { id: 'tsolov', name: 'Nikola Tsolov', code: 'TSO', number: 11, country: 'Bulgaria', countryFlag: '🇧🇬', team: 'Campos Racing', f1Academy: 'Red Bull Junior Team', f1AcademyColor: '#3671C6', points: 82, position: 6, wins: 2, podiums: 3, poles: 1, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/camposracing/niktso01/2026camposracingniktso01right.webp', bio: 'The Bulgarian Lion known for fearless overtaking maneuvers.' },
      { id: 'mansell', name: 'Christian Mansell', code: 'MAN', number: 7, country: 'Australia', countryFlag: '🇦🇺', team: 'ART Grand Prix', f1Academy: 'Independent Star', f1AcademyColor: '#27F4D2', points: 76, position: 7, wins: 1, podiums: 3, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/artgrandprix/chrman01/2026artgrandprixchrman01right.webp', bio: 'Inspiring Australian racer who claimed podiums across Europe.' },
      { id: 'meguetounif', name: 'Sami Meguetounif', code: 'MEG', number: 5, country: 'France', countryFlag: '🇫🇷', team: 'Trident', f1Academy: 'Alpine Academy', f1AcademyColor: '#0090FF', points: 71, position: 8, wins: 1, podiums: 3, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/trident/sammeg01/2026tridentsammeg01right.webp', bio: 'Imola Feature Race winner for Trident.' },
      { id: 'inthraphuvasak', name: 'Tasanapol Inthraphuvasak', code: 'INT', number: 25, country: 'Thailand', countryFlag: '🇹🇭', team: 'PHM AIX Racing', f1Academy: 'Thai Racing Pioneer', f1AcademyColor: '#64C4FF', points: 65, position: 9, wins: 1, podiums: 2, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/phmaixracing/tasint01/2026phmaixracingtasint01right.webp', bio: 'Sprint Race winner at Hungaroring for AIX Racing.' },
      { id: 'rivera', name: 'E. Rivera', code: 'RIV', number: 18, country: 'Mexico', countryFlag: '🇲🇽', team: 'Campos Racing', f1Academy: 'Campos Academy', f1AcademyColor: '#E8002D', points: 58, position: 10, wins: 0, podiums: 2, poles: 0, headshotUrl: 'https://res.cloudinary.com/prod-f2f3/image/upload/common/f3/2026/camposracing/eririv01/2026camposracingeririv01right.webp', bio: 'Consistent points scorer in his debut F3 season.' },
    ],
    teams: [
      { name: 'Trident', points: 341, position: 1, color: '#002F6C', base: 'San Giuliano Milanese, Italy' },
      { name: 'Campos Racing', points: 228, position: 2, color: '#E8002D', base: 'Alzira, Spain' },
      { name: 'MP Motorsport', points: 195, position: 3, color: '#FF4500', base: 'Westmaas, Netherlands' },
      { name: 'ART Grand Prix', points: 154, position: 4, color: '#FFFFFF', base: 'Villeneuve-la-Guyard, France' },
      { name: 'Hitech Pulse-Eight', points: 118, position: 5, color: '#002F6C', base: 'Silverstone, United Kingdom' },
      { name: 'Rodin Motorsport', points: 92, position: 6, color: '#FF8000', base: 'Farnham, United Kingdom' },
      { name: 'PHM AIX Racing', points: 84, position: 7, color: '#3671C6', base: 'Nurburgring, Germany' },
      { name: 'Van Amersfoort Racing', points: 66, position: 8, color: '#FF8000', base: 'Zeewolde, Netherlands' },
      { name: 'Jenzer Motorsport', points: 48, position: 9, color: '#0090FF', base: 'Lyss, Switzerland' },
    ],
    calendar: [
      { round: 1, gpName: 'Bahrain Grand Prix', circuit: 'Bahrain International Circuit', countryFlag: '🇧🇭', date: '28 FEB – 02 MAR', isCompleted: true, sprintWinner: 'Nikola Tsolov', featureWinner: 'Freddie Slater', polePosition: 'Freddie Slater', fastestLap: 'Freddie Slater' },
      { round: 2, gpName: 'Australian Grand Prix', circuit: 'Albert Park Circuit', countryFlag: '🇦🇺', date: '22 MAR – 24 MAR', isCompleted: true, sprintWinner: 'Christian Mansell', featureWinner: 'Ugo Ugochukwu', polePosition: 'Ugo Ugochukwu', fastestLap: 'Tuukka Taponen' },
      { round: 3, gpName: 'Emilia Romagna Grand Prix', circuit: 'Autodromo Enzo e Dino Ferrari', countryFlag: '🇮🇹', date: '17 MAY – 19 MAY', isCompleted: true, sprintWinner: 'Mari Boya', featureWinner: 'Sami Meguetounif', polePosition: 'Rafael Câmara', fastestLap: 'Sami Meguetounif' },
      { round: 4, gpName: 'Monaco Grand Prix', circuit: 'Circuit de Monaco', countryFlag: '🇲🇨', date: '24 MAY – 26 MAY', isCompleted: true, sprintWinner: 'Nikola Tsolov', featureWinner: 'Freddie Slater', polePosition: 'Freddie Slater', fastestLap: 'Freddie Slater' },
      { round: 5, gpName: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', countryFlag: '🇪🇸', date: '21 JUN – 23 JUN', isCompleted: true, sprintWinner: 'Mari Boya', featureWinner: 'Tuukka Taponen', polePosition: 'Tuukka Taponen', fastestLap: 'Tuukka Taponen' },
      { round: 6, gpName: 'Austrian Grand Prix', circuit: 'Red Bull Ring', countryFlag: '🇦🇹', date: '28 JUN – 30 JUN', isCompleted: true, sprintWinner: 'Tasanapol Inthraphuvasak', featureWinner: 'Tuukka Taponen', polePosition: 'Tuukka Taponen', fastestLap: 'Tuukka Taponen' },
      { round: 7, gpName: 'British Grand Prix', circuit: 'Silverstone Circuit', countryFlag: '🇬🇧', date: '05 JUL – 07 JUL', isCompleted: true, sprintWinner: 'Freddie Slater', featureWinner: 'Rafael Câmara', polePosition: 'Freddie Slater', fastestLap: 'Freddie Slater' },
      { round: 8, gpName: 'Hungarian Grand Prix', circuit: 'Hungaroring', countryFlag: '🇭🇺', date: '19 JUL – 21 JUL', isCompleted: true, sprintWinner: 'Tasanapol Inthraphuvasak', featureWinner: 'Freddie Slater', polePosition: 'Freddie Slater', fastestLap: 'Freddie Slater' },
      { round: 9, gpName: 'Belgian Grand Prix', circuit: 'Circuit de Spa-Francorchamps', countryFlag: '🇧🇪', date: '26 JUL – 28 JUL', isCompleted: true, sprintWinner: 'Ugo Ugochukwu', featureWinner: 'Tuukka Taponen', polePosition: 'Tuukka Taponen', fastestLap: 'Tuukka Taponen' },
      { round: 10, gpName: 'Italian Grand Prix', circuit: 'Autodromo Nazionale Monza', countryFlag: '🇮🇹', date: '30 AUG – 01 SEP', isCompleted: true, sprintWinner: 'Rafael Câmara', featureWinner: 'Freddie Slater', polePosition: 'Freddie Slater', fastestLap: 'Freddie Slater' },
    ],
  },
  academy: {
    seriesId: 'academy',
    seriesName: 'F1 Academy',
    championshipYear: '2026',
    description: 'Official all-female driver development championship supported directly by all 10 Formula 1 teams.',
    regulations: 'Two 30-minute races per weekend with F1 team livery designations. Points scale 25-18-15-12-10-8-6-4-2-1.',
    carSpecs: {
      model: 'Tatuus F4-T421 Chassis',
      chassis: 'Carbon-fibre monocoque with FIA Halo safety device',
      engine: 'Autotecnica 1.4L 4-cylinder Turbocharged',
      power: '174 HP @ 6,500 RPM',
      topSpeed: '240 km/h (149 mph)',
      acceleration: '0–100 km/h in 3.6 seconds',
      gearbox: 'Sadev 6-speed sequential paddle-shift',
      weight: '570 kg (minimum weight including driver)',
      tyres: 'Pirelli 13-inch bespoke compounds',
      fuel: 'Sustainable E10 Fuel',
    },
    drivers: [
      { id: 'pulling', name: 'Abbi Pulling', code: 'PUL', number: 9, country: 'United Kingdom', countryFlag: '🇬🇧', team: 'Rodin Motorsport', f1Academy: 'Alpine F1 Team', f1AcademyColor: '#0090FF', points: 198, position: 1, wins: 7, podiums: 10, poles: 6, bio: 'Dominant F1 Academy Champion backed by Alpine F1 Team.' },
      { id: 'weug', name: 'Maya Weug', code: 'WEU', number: 64, country: 'Netherlands', countryFlag: '🇳🇱', team: 'MP Motorsport', f1Academy: 'Scuderia Ferrari HP', f1AcademyColor: '#E8002D', points: 142, position: 2, wins: 3, podiums: 7, poles: 2, bio: 'Ferrari Driver Academy trailblazer who claimed victories in Miami and Barcelona.' },
      { id: 'pin', name: 'Doriane Pin', code: 'PIN', number: 28, country: 'France', countryFlag: '🇫🇷', team: 'PREMA Racing', f1Academy: 'Mercedes-AMG PETRONAS', f1AcademyColor: '#27F4D2', points: 136, position: 3, wins: 3, podiums: 6, poles: 3, bio: 'Iron Dames and Mercedes Junior star with race-winning pedigree.' },
      { id: 'chambers', name: 'Chloe Chambers', code: 'CHA', number: 14, country: 'United States', countryFlag: '🇺🇸', team: 'Campos Racing', f1Academy: 'Haas F1 Team', f1AcademyColor: '#E6002B', points: 108, position: 4, wins: 1, podiums: 5, poles: 1, bio: 'American sensation driving under the official Haas F1 livery.' },
      { id: 'alqubaisi_h', name: 'Hamda Al Qubaisi', code: 'ALQ', number: 88, country: 'United Arab Emirates', countryFlag: '🇦🇪', team: 'MP Motorsport', f1Academy: 'Red Bull Racing', f1AcademyColor: '#3671C6', points: 94, position: 5, wins: 1, podiums: 4, poles: 0, bio: 'Emirati racing star competing for Red Bull Racing.' },
      { id: 'bustamante', name: 'Bianca Bustamante', code: 'BUS', number: 16, country: 'Philippines', countryFlag: '🇵🇭', team: 'ART Grand Prix', f1Academy: 'McLaren F1 Team', f1AcademyColor: '#FF8000', points: 82, position: 6, wins: 1, podiums: 3, poles: 0, bio: 'Filipina fan favorite representing McLaren.' },
    ],
    teams: [
      { name: 'Rodin Motorsport', points: 242, position: 1, color: '#FF8000', base: 'Farnham, United Kingdom' },
      { name: 'MP Motorsport', points: 236, position: 2, color: '#FF4500', base: 'Westmaas, Netherlands' },
      { name: 'PREMA Racing', points: 218, position: 3, color: '#E8002D', base: 'Grisignano di Zocco, Italy' },
      { name: 'Campos Racing', points: 174, position: 4, color: '#E8002D', base: 'Alzira, Spain' },
      { name: 'ART Grand Prix', points: 142, position: 5, color: '#FFFFFF', base: 'Villeneuve-la-Guyard, France' },
    ],
    calendar: [
      { round: 1, gpName: 'Saudi Arabian Grand Prix', circuit: 'Jeddah Corniche Circuit', countryFlag: '🇸🇦', date: '07 MAR – 09 MAR', isCompleted: true, sprintWinner: 'Abbi Pulling', featureWinner: 'Doriane Pin', polePosition: 'Doriane Pin', fastestLap: 'Abbi Pulling' },
      { round: 2, gpName: 'Miami Grand Prix', circuit: 'Miami International Autodrome', countryFlag: '🇺🇸', date: '03 MAY – 05 MAY', isCompleted: true, sprintWinner: 'Maya Weug', featureWinner: 'Abbi Pulling', polePosition: 'Abbi Pulling', fastestLap: 'Maya Weug' },
      { round: 3, gpName: 'Spanish Grand Prix', circuit: 'Circuit de Barcelona-Catalunya', countryFlag: '🇪🇸', date: '21 JUN – 23 JUN', isCompleted: true, sprintWinner: 'Chloe Chambers', featureWinner: 'Abbi Pulling', polePosition: 'Abbi Pulling', fastestLap: 'Abbi Pulling' },
      { round: 4, gpName: 'Dutch Grand Prix', circuit: 'Circuit Zandvoort', countryFlag: '🇳🇱', date: '23 AUG – 25 AUG', isCompleted: true, sprintWinner: 'Doriane Pin', featureWinner: 'Maya Weug', polePosition: 'Maya Weug', fastestLap: 'Maya Weug' },
      { round: 5, gpName: 'Singapore Grand Prix', circuit: 'Marina Bay Street Circuit', countryFlag: '🇸🇬', date: '20 SEP – 22 SEP', isCompleted: false },
      { round: 6, gpName: 'Qatar Grand Prix', circuit: 'Lusail International Circuit', countryFlag: '🇶🇦', date: '29 NOV – 01 DEC', isCompleted: false },
      { round: 7, gpName: 'Abu Dhabi Grand Prix', circuit: 'Yas Marina Circuit', countryFlag: '🇦🇪', date: '06 DEC – 08 DEC', isCompleted: false },
    ],
  },
};

export function getAcademyDriversForTeam(teamId: string): JuniorDriver[] {
  const normId = teamId.toLowerCase();
  const allDrivers = [
    ...JUNIOR_SERIES_DATABASE.f2.drivers,
    ...JUNIOR_SERIES_DATABASE.f3.drivers,
    ...JUNIOR_SERIES_DATABASE.academy.drivers,
  ];

  return allDrivers.filter((d) => {
    if (!d.f1Academy) return false;
    const ac = d.f1Academy.toLowerCase();
    return ac.includes(normId) || normId.includes(ac);
  });
}
