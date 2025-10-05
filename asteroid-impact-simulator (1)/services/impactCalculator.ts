
import { Asteroid, ImpactResult } from '../types';
import { ASTEROID_DENSITY, JOULES_PER_MEGATON_TNT, TARGET_DENSITY_ROCK, EARTH_GRAVITY } from '../constants';

export function calculateImpact(asteroid: Asteroid, isOceanImpact: boolean): ImpactResult {
  const mass = ASTEROID_DENSITY * (4 / 3) * Math.PI * Math.pow(asteroid.diameter / 2, 3);
  const velocityMetersPerSecond = asteroid.velocity * 1000;

  // 1. Calculate Kinetic Energy
  const kineticEnergyJoules = 0.5 * mass * Math.pow(velocityMetersPerSecond, 2);
  const energyMegatons = kineticEnergyJoules / JOULES_PER_MEGATON_TNT;

  // 2. Calculate Crater Diameter (simplified Holsapple-Schmidt for dry rock)
  // Assuming a 90-degree impact for simplicity
  const craterDiameter = 1.161 * Math.pow(ASTEROID_DENSITY / TARGET_DENSITY_ROCK, 1/3) * Math.pow(asteroid.diameter, 0.78) * Math.pow(velocityMetersPerSecond, 0.44) * Math.pow(EARTH_GRAVITY, -0.22);

  // 3. Calculate Fireball Radius
  const fireballRadius = 0.003 * Math.pow(kineticEnergyJoules, 1 / 3);

  // 4. Calculate Shockwave Radii (based on empirical formulas for nuclear blasts)
  const Y = energyMegatons; // Yield in Megatons
  const severeDamageRadius = 1609.34 * (0.18 * Math.pow(Y, 1/3)); // 20 psi -> meters
  const moderateDamageRadius = 1609.34 * (0.45 * Math.pow(Y, 1/3)); // 5 psi -> meters
  const lightDamageRadius = 1609.34 * (1.5 * Math.pow(Y, 1/3)); // 1 psi -> meters

  // 5. Tsunami calculation
  let waveHeight = 0;
  if (isOceanImpact && energyMegatons > 1) {
    // Highly simplified formula based on impact energy
    waveHeight = 10 * Math.pow(energyMegatons, 0.25); 
  }

  return {
    asteroidName: asteroid.name,
    energy: energyMegatons,
    craterDiameter: isOceanImpact ? 0 : craterDiameter,
    fireballRadius: fireballRadius,
    shockwave: {
      severeDamageRadius,
      moderateDamageRadius,
      lightDamageRadius,
    },
    tsunami: {
      isTsunami: isOceanImpact,
      waveHeight: waveHeight,
    },
  };
}
