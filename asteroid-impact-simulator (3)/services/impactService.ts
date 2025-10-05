
import type { Asteroid, ImpactResults, ImpactTarget } from '../types';
import { ASTEROID_DENSITY_ROCK, TNT_JOULES_PER_MEGATON } from '../constants';

export const calculateImpact = (asteroid: Asteroid, target: ImpactTarget): ImpactResults => {
  const { diameter_meters, relative_velocity_kph } = asteroid;
  
  // 1. Calculate Mass
  const radius = diameter_meters / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass_kg = volume * ASTEROID_DENSITY_ROCK;

  // 2. Calculate Kinetic Energy
  const velocity_mps = (relative_velocity_kph * 1000) / 3600;
  const kinetic_energy_joules = 0.5 * mass_kg * Math.pow(velocity_mps, 2);
  const energy_megatons = kinetic_energy_joules / TNT_JOULES_PER_MEGATON;

  // 3. Simplified Cratering (Holsapple-Schmidt scaling approximation for rock)
  const crater_scaling_factor = target === 'land' ? 0.8 : 0;
  const craterDiameter = crater_scaling_factor * Math.pow(kinetic_energy_joules, 0.28) * 1.5;
  const craterDepth = craterDiameter / 3;

  // 4. Fireball Radius (Based on energy)
  const fireballRadius = Math.pow(energy_megatons, 0.33) * 300;

  // 5. Airblast/Shockwave Radius (Based on empirical relations)
  // These are approximations from various sources
  const shockwave = {
    psi20: Math.pow(energy_megatons, 0.33) * 400,   // Heavy destruction
    psi5: Math.pow(energy_megatons, 0.33) * 1200,  // Standard building collapse
    psi1: Math.pow(energy_megatons, 0.33) * 4500,  // Window shattering
  };
  
  // 6. Tsunami Calculation (very simplified)
  let isTsunami = false;
  let waveHeight = 0;
  if (target === 'ocean' && energy_megatons > 1) {
    isTsunami = true;
    // Extremely simplified model: wave height at 100km
    waveHeight = Math.pow(energy_megatons, 0.5) * 0.5; 
  }

  return {
    energy: energy_megatons,
    craterDiameter,
    craterDepth,
    fireballRadius,
    shockwave,
    tsunami: {
      isTsunami,
      waveHeight,
    },
  };
};
