
export interface Asteroid {
  id: string;
  name: string;
  diameter_meters: number;
  relative_velocity_kph: number;
  is_potentially_hazardous_asteroid: boolean;
}

export interface ImpactResults {
  energy: number; // in megatons of TNT
  craterDiameter: number; // in meters
  craterDepth: number; // in meters
  fireballRadius: number; // in meters
  shockwave: {
    psi20: number; // radius in meters for 20 PSI (heavy damage)
    psi5: number;  // radius in meters for 5 PSI (building collapse)
    psi1: number;  // radius in meters for 1 PSI (window shatter)
  };
  tsunami: {
    isTsunami: boolean;
    waveHeight: number; // in meters at 100km distance
  };
}

export interface NasaNeo {
  id: string;
  name: string;
  estimated_diameter: {
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    relative_velocity: {
      kilometers_per_hour: string;
    };
  }[];
}

export type ImpactTarget = 'land' | 'ocean';
