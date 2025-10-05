
import type { AsteroidParams, ImpactData } from '../types';
import { MEGATON_JOULES } from '../constants';

// Simplified physics calculations for the simulation
export function calculateImpact(params: AsteroidParams, density: number): ImpactData {
  const radius = params.diameter / 2; // m
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3); // m^3
  const mass = volume * density; // kg

  const velocity = params.speed * 1000; // m/s
  const angleRad = params.angle * (Math.PI / 180);

  // Kinetic Energy
  const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2); // Joules
  
  // Adjust energy for atmospheric entry angle
  const impactEnergy = kineticEnergy * Math.sin(angleRad);
  const energyInMegatons = impactEnergy / MEGATON_JOULES;

  // Crater Diameter (simplified Holsapple-Schmidt scaling approximation)
  // For simplicity, we make it largely dependent on energy and diameter
  const craterDiameterKm = 0.02 * Math.pow(energyInMegatons, 0.28) * (params.diameter/100);

  // Fireball Radius (from "The Effects of Nuclear Weapons" by Glasstone and Dolan)
  const fireballRadiusKm = 0.03 * Math.pow(energyInMegatons, 0.33);

  // Shockwave Radii (approximations)
  const shockwave = [
    {
      overpressure: 20, // PSI - Reinforced concrete buildings destroyed
      radius: 0.1 * Math.pow(energyInMegatons, 0.33), // km
      description: "Severe damage"
    },
    {
      overpressure: 5, // PSI - Most residential buildings collapse
      radius: 0.3 * Math.pow(energyInMegatons, 0.33), // km
      description: "Buildings collapse"
    },
    {
      overpressure: 1, // PSI - Windows shatter
      radius: 1.0 * Math.pow(energyInMegatons, 0.33), // km
      description: "Windows shatter"
    }
  ];

  // Ejecta
  const ejectaThickness = Math.max(1, craterDiameterKm * 10); // meters at rim

  // Tsunami
  let tsunamiWarning = '';
  if (params.isOceanImpact) {
      if (energyInMegatons > 1) {
          const waveHeight = Math.pow(energyInMegatons, 0.5) * 5; // Very rough estimation
          tsunamiWarning = `A megatsunami is generated. Initial wave height near the impact could exceed ${waveHeight.toFixed(0)} meters, threatening coastlines thousands of kilometers away.`;
      } else {
          tsunamiWarning = `A significant local tsunami is generated, posing a threat to nearby coastlines.`;
      }
  }

  return {
    energy: energyInMegatons,
    craterDiameter: craterDiameterKm,
    fireballRadius: fireballRadiusKm,
    shockwave: shockwave,
    ejectaThickness: ejectaThickness,
    tsunamiWarning: tsunamiWarning,
  };
}
