
import type { Asteroid, NasaNeo } from '../types';
import { NASA_API_KEY } from '../constants';

const API_BASE_URL = 'https://api.nasa.gov/neo/rest/v1/feed';

function getFutureDateString(daysInFuture: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysInFuture);
  return date.toISOString().split('T')[0];
}

export const fetchPotentiallyHazardousAsteroids = async (): Promise<Asteroid[]> => {
  const startDate = getFutureDateString(365);
  const endDate = getFutureDateString(372);
  
  const url = `${API_BASE_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data from NASA NEO API');
  }
  const data = await response.json();
  const neoData = data.near_earth_objects;

  const asteroids: Asteroid[] = [];
  Object.keys(neoData).forEach(date => {
    neoData[date].forEach((neo: NasaNeo) => {
      if (neo.is_potentially_hazardous_asteroid && neo.close_approach_data.length > 0) {
        asteroids.push({
          id: neo.id,
          name: neo.name.replace(/[()]/g, ''),
          diameter_meters: (neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max) / 2,
          relative_velocity_kph: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_hour),
          is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
        });
      }
    });
  });

  return asteroids.sort((a, b) => b.diameter_meters - a.diameter_meters);
};
