
import type { AsteroidMaterial } from './types';

export const ASTEROID_DENSITIES: Record<AsteroidMaterial, number> = {
  IRON: 8000,
  STONE: 3500,
  CARBON: 2200,
};

export const G = 6.67430e-11;
export const EARTH_MASS = 5.972e24;
export const EARTH_RADIUS = 6371 * 1000;

export const MEGATON_JOULES = 4.184e15;
