export interface CircuitMedia {
  id: string;
  name: string;
  location: string;
  countryFlag: string;
  imageUrl: string;
  mapUrl?: string;
  trackLength: string;
  turns: number;
}

export const CIRCUIT_DATABASE: Record<string, CircuitMedia> = {
  bahrain: {
    id: 'bahrain',
    name: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrain',
    countryFlag: '🇧🇭',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.412 km',
    turns: 15,
  },
  jeddah: {
    id: 'jeddah',
    name: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Saudi Arabia',
    countryFlag: '🇸🇦',
    imageUrl: 'https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80',
    trackLength: '6.174 km',
    turns: 27,
  },
  melbourne: {
    id: 'melbourne',
    name: 'Albert Park Circuit',
    location: 'Melbourne, Australia',
    countryFlag: '🇦🇺',
    imageUrl: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.278 km',
    turns: 14,
  },
  suzuka: {
    id: 'suzuka',
    name: 'Suzuka International Racing Course',
    location: 'Suzuka, Japan',
    countryFlag: '🇯🇵',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.807 km',
    turns: 18,
  },
  shanghai: {
    id: 'shanghai',
    name: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    countryFlag: '🇨🇳',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.451 km',
    turns: 16,
  },
  miami: {
    id: 'miami',
    name: 'Miami International Autodrome',
    location: 'Miami, USA',
    countryFlag: '🇺🇸',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.412 km',
    turns: 19,
  },
  imola: {
    id: 'imola',
    name: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Italy',
    countryFlag: '🇮🇹',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.909 km',
    turns: 19,
  },
  monaco: {
    id: 'monaco',
    name: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    countryFlag: '🇲🇨',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80',
    trackLength: '3.337 km',
    turns: 19,
  },
  montreal: {
    id: 'montreal',
    name: 'Circuit Gilles-Villeneuve',
    location: 'Montreal, Canada',
    countryFlag: '🇨🇦',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.361 km',
    turns: 14,
  },
  barcelona: {
    id: 'barcelona',
    name: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Spain',
    countryFlag: '🇪🇸',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.657 km',
    turns: 14,
  },
  spielberg: {
    id: 'spielberg',
    name: 'Red Bull Ring',
    location: 'Spielberg, Austria',
    countryFlag: '🇦🇹',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.318 km',
    turns: 10,
  },
  silverstone: {
    id: 'silverstone',
    name: 'Silverstone Circuit',
    location: 'Silverstone, UK',
    countryFlag: '🇬🇧',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.891 km',
    turns: 18,
  },
  hungaroring: {
    id: 'hungaroring',
    name: 'Hungaroring',
    location: 'Budapest, Hungary',
    countryFlag: '🇭🇺',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.381 km',
    turns: 14,
  },
  spa: {
    id: 'spa',
    name: 'Circuit de Spa-Francorchamps',
    location: 'Stavelot, Belgium',
    countryFlag: '🇧🇪',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
    trackLength: '7.004 km',
    turns: 19,
  },
  zandvoort: {
    id: 'zandvoort',
    name: 'Circuit Zandvoort',
    location: 'Zandvoort, Netherlands',
    countryFlag: '🇳🇱',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.259 km',
    turns: 14,
  },
  monza: {
    id: 'monza',
    name: 'Autodromo Nazionale Monza',
    location: 'Monza, Italy',
    countryFlag: '🇮🇹',
    imageUrl: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.793 km',
    turns: 11,
  },
  baku: {
    id: 'baku',
    name: 'Baku City Circuit',
    location: 'Baku, Azerbaijan',
    countryFlag: '🇦🇿',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    trackLength: '6.003 km',
    turns: 20,
  },
  singapore: {
    id: 'singapore',
    name: 'Marina Bay Street Circuit',
    location: 'Marina Bay, Singapore',
    countryFlag: '🇸🇬',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.940 km',
    turns: 19,
  },
  austin: {
    id: 'austin',
    name: 'Circuit of The Americas',
    location: 'Austin, USA',
    countryFlag: '🇺🇸',
    imageUrl: 'https://images.unsplash.com/photo-1531219432768-9f540ce91ef3?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.513 km',
    turns: 20,
  },
  mexico: {
    id: 'mexico',
    name: 'Autódromo Hermanos Rodríguez',
    location: 'Mexico City, Mexico',
    countryFlag: '🇲🇽',
    imageUrl: 'https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.304 km',
    turns: 17,
  },
  interlagos: {
    id: 'interlagos',
    name: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brazil',
    countryFlag: '🇧🇷',
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80',
    trackLength: '4.309 km',
    turns: 15,
  },
  las_vegas: {
    id: 'las_vegas',
    name: 'Las Vegas Strip Circuit',
    location: 'Las Vegas, USA',
    countryFlag: '🇺🇸',
    imageUrl: 'https://images.unsplash.com/photo-1581351123004-757df051db8e?auto=format&fit=crop&w=1200&q=80',
    trackLength: '6.201 km',
    turns: 17,
  },
  lusail: {
    id: 'lusail',
    name: 'Lusail International Circuit',
    location: 'Lusail, Qatar',
    countryFlag: '🇶🇦',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.419 km',
    turns: 16,
  },
  yas_marina: {
    id: 'yas_marina',
    name: 'Yas Marina Circuit',
    location: 'Abu Dhabi, UAE',
    countryFlag: '🇦🇪',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.281 km',
    turns: 16,
  },
};

export function getCircuitMedia(gpName: string): CircuitMedia {
  const norm = gpName.toLowerCase();
  for (const [key, circuit] of Object.entries(CIRCUIT_DATABASE)) {
    if (norm.includes(key) || norm.includes(circuit.name.toLowerCase()) || norm.includes(circuit.location.toLowerCase())) {
      return circuit;
    }
  }
  // Default fallback circuit photo
  return {
    id: 'generic',
    name: gpName,
    location: 'Grand Prix Circuit',
    countryFlag: '🏎️',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1200&q=80',
    trackLength: '5.400 km',
    turns: 16,
  };
}
