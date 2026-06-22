export type Continent = 'North America' | 'South America' | 'Europe' | 'Asia' | 'Africa' | 'Oceania';

export type Place = {
  /** Display label, e.g. "Mexico City" or "Thailand". */
  city: string;
  country: string;
  lat: number;
  lng: number;
  /** The home base (Miami). Rendered as a larger marker. */
  home?: true;
  /** Optional, for later enrichment. */
  year?: number;
  /** Optional, for later enrichment. */
  note?: string;
};

/** Every country used in PLACES maps to its continent (drives the tally). */
export const CONTINENT_BY_COUNTRY: Record<string, Continent> = {
  USA: 'North America',
  Mexico: 'North America',
  Guatemala: 'North America',
  'El Salvador': 'North America',
  Venezuela: 'South America',
  Peru: 'South America',
  Colombia: 'South America',
  France: 'Europe',
  UK: 'Europe',
  Spain: 'Europe',
  Romania: 'Europe',
  Italy: 'Europe',
  UAE: 'Asia',
  India: 'Asia',
  Thailand: 'Asia',
};

/** Places visited plus the Miami home base. Append-friendly: one line per place. */
export const PLACES: Place[] = [
  { city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918, home: true },
  { city: 'New York City', country: 'USA', lat: 40.7128, lng: -74.006 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Philadelphia', country: 'USA', lat: 39.9526, lng: -75.1652 },
  { city: 'Knoxville', country: 'USA', lat: 35.9606, lng: -83.9207 },
  { city: 'Las Vegas', country: 'USA', lat: 36.1699, lng: -115.1398 },
  { city: 'Yosemite National Park', country: 'USA', lat: 37.8651, lng: -119.5383 },
  { city: 'Lake Tahoe', country: 'USA', lat: 39.0968, lng: -120.0324 },
  { city: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  { city: 'Cancún', country: 'Mexico', lat: 21.1619, lng: -86.8515 },
  { city: 'Guatemala City', country: 'Guatemala', lat: 14.6349, lng: -90.5069 },
  { city: 'Antigua Guatemala', country: 'Guatemala', lat: 14.5586, lng: -90.7295 },
  { city: 'San Salvador', country: 'El Salvador', lat: 13.6929, lng: -89.2182 },
  { city: 'Caracas', country: 'Venezuela', lat: 10.4806, lng: -66.9036 },
  { city: 'Lima', country: 'Peru', lat: -12.0464, lng: -77.0428 },
  { city: 'Bogotá', country: 'Colombia', lat: 4.711, lng: -74.0721 },
  { city: 'Medellín', country: 'Colombia', lat: 6.2442, lng: -75.5812 },
  { city: 'Cartagena', country: 'Colombia', lat: 10.391, lng: -75.4794 },
  { city: 'Tayrona', country: 'Colombia', lat: 11.3, lng: -74.05 },
  { city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
  { city: 'San Sebastián', country: 'Spain', lat: 43.3183, lng: -1.9812 },
  { city: 'Barcelona', country: 'Spain', lat: 41.3874, lng: 2.1686 },
  { city: 'Mallorca', country: 'Spain', lat: 39.5696, lng: 2.6502 },
  { city: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025 },
  { city: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { city: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.19 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { city: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209 },
  { city: 'Thailand', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
];
