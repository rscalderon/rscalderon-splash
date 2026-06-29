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
