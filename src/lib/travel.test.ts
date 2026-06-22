import { describe, it, expect } from 'vitest';
import { getTally, uncategorizedCountries, focusAngles } from './travel';
import { PLACES } from '@/constants/travel';

describe('travel data', () => {
  it('every country maps to a continent', () => {
    expect(uncategorizedCountries(PLACES)).toEqual([]);
  });

  it('computes the headline tally', () => {
    const t = getTally(PLACES);
    expect(t.places).toBe(PLACES.length);
    expect(t.countries).toBe(15);
    expect(t.continents).toBe(4);
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

  it('maps lat/lng 0,0 to ~0 rotation', () => {
    const a = focusAngles({ lat: 0, lng: 0 });
    expect(a.phi).toBeCloseTo(0, 5);
    expect(a.theta).toBeCloseTo(0, 5);
  });

  it('rotates for longitude and clamps theta near the poles', () => {
    expect(focusAngles({ lat: 0, lng: 90 }).phi).toBeCloseTo(-Math.PI / 2, 5);
    expect(focusAngles({ lat: 89, lng: 0 }).theta).toBe(0.8);
  });
});
