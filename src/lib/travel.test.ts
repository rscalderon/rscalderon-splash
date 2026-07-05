import { describe, it, expect } from 'vitest';
import { getTally, uncategorizedCountries, focusAngles, sortedPlaces } from './travel';
import { PLACES, type Place } from '@/constants/travel';

describe('travel data', () => {
  it('every country maps to a continent', () => {
    expect(uncategorizedCountries(PLACES)).toEqual([]);
  });

  it('computes the headline tally', () => {
    const t = getTally(PLACES);
    expect(t.places).toBe(PLACES.length);
    expect(t.countries).toBe(22);
    expect(t.continents).toBe(4);
  });

  it('includes the seven newly added countries', () => {
    const countries = new Set(PLACES.map((p) => p.country));
    for (const c of ['Costa Rica', 'Nicaragua', 'Honduras', 'Portugal', 'Bahamas', 'Ecuador', 'Singapore']) {
      expect(countries.has(c)).toBe(true);
    }
  });

  it('includes the eight Thailand islands and beaches', () => {
    const cities = new Set(PLACES.map((p) => p.city));
    for (const c of ['Koh Tao', 'Koh Samui', 'Koh Lanta', 'Phuket', 'Krabi', 'Railay Beach', 'Koh Phi Phi', 'Koh Pha Ngan']) {
      expect(cities.has(c)).toBe(true);
    }
  });

  it('labels every place with a specific city, never a bare country name', () => {
    // City-states are the legitimate exception: the city *is* the country.
    const CITY_STATES = new Set(['Singapore']);
    const bareCountries = PLACES.filter((p) => p.city === p.country && !CITY_STATES.has(p.country));
    expect(bareCountries.map((p) => p.city)).toEqual([]);
  });

  it('counts unique countries and continents on a fixture', () => {
    const t = getTally([
      { city: 'A', country: 'USA', lat: 0, lng: 0 },
      { city: 'B', country: 'USA', lat: 1, lng: 1 },
      { city: 'C', country: 'France', lat: 2, lng: 2 },
    ]);
    expect(t).toEqual({ places: 3, countries: 2, continents: 2 });
  });

  it('has exactly one home base, Miami', () => {
    expect(PLACES.filter((p) => p.home)).toHaveLength(1);
    expect(PLACES.find((p) => p.home)?.city).toBe('Miami');
  });

  it('sorts places alphabetically by city, locale-aware, without mutating input', () => {
    const input: Place[] = [
      { city: 'Zürich', country: 'Switzerland', lat: 0, lng: 0 },
      { city: 'Austin', country: 'USA', lat: 0, lng: 0 },
      { city: 'Bogotá', country: 'Colombia', lat: 0, lng: 0 },
    ];
    const snapshot = input.map((p) => p.city);
    expect(sortedPlaces(input).map((p) => p.city)).toEqual(['Austin', 'Bogotá', 'Zürich']);
    expect(input.map((p) => p.city)).toEqual(snapshot); // input untouched
  });

  it('orders the real PLACES list alphabetically and keeps every place', () => {
    const out = sortedPlaces(PLACES);
    expect(out).toHaveLength(PLACES.length);
    expect(out.map((p) => p.city)).toEqual(
      PLACES.map((p) => p.city).sort((a, b) => a.localeCompare(b)),
    );
  });

  it('faces lat/lng 0,0 with cobe’s 1.5π front-meridian offset', () => {
    const a = focusAngles({ lat: 0, lng: 0 });
    expect(a.phi).toBeCloseTo((3 * Math.PI) / 2, 5);
    expect(a.theta).toBeCloseTo(0, 5);
  });

  it('shifts phi by longitude and clamps theta near the poles', () => {
    // 90°E rotates phi a quarter-turn off the front meridian
    expect(focusAngles({ lat: 0, lng: 90 }).phi).toBeCloseTo((3 * Math.PI) / 2 - Math.PI / 2, 5);
    // latitude maps straight through to theta...
    expect(focusAngles({ lat: 40, lng: 0 }).theta).toBeCloseTo((40 * Math.PI) / 180, 5);
    // ...but is clamped so extreme latitudes don't over-tilt the view
    expect(focusAngles({ lat: 89, lng: 0 }).theta).toBe(1.3);
  });
});
