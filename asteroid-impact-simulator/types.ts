
export interface NasaNeoData {
  links: object;
  element_count: number;
  near_earth_objects: {
    [date: string]: NasaNeo[];
  };
}

export interface NasaNeo {
  id: string;
  neo_reference_id: string;
  name: string;
  nasa_jpl_url: string;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
    meters: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date_full: string;
    relative_velocity: {
      kilometers_per_second: string;
    };
  }[];
}

export interface Asteroid {
  id: string;
  name: string;
  diameter: number; // meters
  velocity: number; // km/s
  isPotentiallyHazardous: boolean;
}

export interface ImpactResult {
  asteroidName: string;
  energy: number; // megatons of TNT
  craterDiameter: number; // meters
  fireballRadius: number; // meters
  shockwave: {
    severeDamageRadius: number; // meters, 20 psi
    moderateDamageRadius: number; // meters, 5 psi
    lightDamageRadius: number; // meters, 1 psi
  };
  tsunami: {
    isTsunami: boolean;
    waveHeight: number; // meters
  };
}
