import type { Place } from '@/constants/travel';
import { CONTINENT_BY_COUNTRY, PLACES } from '@/constants/travel';

export type Tally = { places: number; countries: number; continents: number };

/** Derive the headline counts from a list of places. */
export function getTally(places: Place[] = PLACES): Tally {
  const countries = new Set(places.map((p) => p.country));
  const continents = new Set(places.map((p) => CONTINENT_BY_COUNTRY[p.country]));
  return { places: places.length, countries: countries.size, continents: continents.size };
}

/** Countries in `places` missing from CONTINENT_BY_COUNTRY (should always be empty). */
export function uncategorizedCountries(places: Place[] = PLACES): string[] {
  return [...new Set(places.map((p) => p.country))].filter((c) => !CONTINENT_BY_COUNTRY[c]);
}

/** A great-circle arc between two [lat, lng] points, as cobe consumes it. */
export type GlobeArc = { from: [number, number]; to: [number, number] };

/** The single home base (Miami). Throws if the data ever loses its lone `home: true`. */
export function homePlace(places: Place[] = PLACES): Place {
  const home = places.find((p) => p.home);
  if (!home) throw new Error('No home place found (expected exactly one place with home: true)');
  return home;
}

/** One arc from home to every non-home place. */
export function buildArcs(places: Place[] = PLACES): GlobeArc[] {
  const home = homePlace(places);
  const from: [number, number] = [home.lat, home.lng];
  return places.filter((p) => !p.home).map((p) => ({ from, to: [p.lat, p.lng] }));
}

export type FocusAngles = { phi: number; theta: number };

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/**
 * Convert a place's lat/lng into cobe rotation targets that bring it to the front
 * of the globe. Matches cobe's canonical `locationToAngles` mapping: phi carries a
 * 1.5π offset so the front-facing meridian lines up with the marker's longitude.
 * theta is clamped so the poles don't over-tilt the view.
 */
export function focusAngles(place: Pick<Place, 'lat' | 'lng'>): FocusAngles {
  const phi = (3 * Math.PI) / 2 - (place.lng * Math.PI) / 180;
  const theta = clamp((place.lat * Math.PI) / 180, -1.3, 1.3);
  return { phi, theta };
}
