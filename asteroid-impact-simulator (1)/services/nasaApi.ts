
import { NASA_API_URL, NASA_API_KEY } from '../constants';
import { NasaNeoData, NasaNeo, Asteroid } from '../types';

export async function fetchAsteroids(startDate: string, endDate: string): Promise<Asteroid[]> {
  const url = `${NASA_API_URL}?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data from NASA API');
  }
  const data: NasaNeoData = await response.json();
  
  const asteroids: Asteroid[] = [];
  Object.values(data.near_earth_objects).forEach((day: NasaNeo[]) => {
    day.forEach((neo: NasaNeo) => {
      if (neo.close_approach_data.length > 0 && neo.estimated_diameter?.meters) {
        asteroids.push({
          id: neo.id,
          name: neo.name.replace(/[()]/g, ''),
          diameter: (neo.estimated_diameter.meters.estimated_diameter_min + neo.estimated_diameter.meters.estimated_diameter_max) / 2,
          velocity: parseFloat(neo.close_approach_data[0].relative_velocity.kilometers_per_second),
          isPotentiallyHazardous: neo.is_potentially_hazardous_asteroid,
        });
      }
    });
  });

  // Sort by diameter, largest first
  return asteroids.sort((a, b) => b.diameter - a.diameter);
}
