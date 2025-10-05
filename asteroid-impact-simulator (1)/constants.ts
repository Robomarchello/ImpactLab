
// NOTE: DEMO_KEY has very strict rate limits. For a real application, get a key from https://api.nasa.gov/
export const NASA_API_KEY = 'DEMO_KEY';
export const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/feed';

// Physics Constants for impact calculation
export const ASTEROID_DENSITY = 2000; // kg/m^3 (average for stony asteroids)
export const EARTH_GRAVITY = 9.81; // m/s^2
export const TARGET_DENSITY_ROCK = 2700; // kg/m^3
export const JOULES_PER_MEGATON_TNT = 4.184e15;
