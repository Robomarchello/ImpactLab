
import type { LatLng } from 'leaflet';

export type AsteroidMaterial = 'IRON' | 'STONE' | 'CARBON';

export interface AsteroidParams {
  diameter: number; // meters
  speed: number; // km/s
  angle: number; // degrees
  density: AsteroidMaterial;
  isOceanImpact: boolean;
}

export interface ImpactData {
  energy: number; // megatons of TNT
  craterDiameter: number; // km
  fireballRadius: number; // km
  shockwave: {
    overpressure: number; // PSI
    radius: number; // km
    description: string;
  }[];
  ejectaThickness: number; // meters at crater rim
  tsunamiWarning: string;
}

export interface SimulationResult {
  id: number;
  location: LatLng;
  data: ImpactData;
  summary: string;
}
