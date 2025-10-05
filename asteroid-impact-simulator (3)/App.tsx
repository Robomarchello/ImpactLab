
import React, { useState, useEffect, useCallback } from 'react';
import type { LatLng } from 'leaflet';
import type { Asteroid, ImpactResults, ImpactTarget } from './types';
import { fetchPotentiallyHazardousAsteroids } from './services/nasaService';
import { calculateImpact } from './services/impactService';
import ControlPanel from './components/ControlPanel';
import MapDisplay from './components/MapDisplay';
import ResultsPanel from './components/ResultsPanel';
import CustomAsteroidModal from './components/CustomAsteroidModal';

const App: React.FC = () => {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [selectedAsteroid, setSelectedAsteroid] = useState<Asteroid | null>(null);
  const [impactLocation, setImpactLocation] = useState<LatLng | null>(null);
  const [impactResults, setImpactResults] = useState<ImpactResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [impactTarget, setImpactTarget] = useState<ImpactTarget>('land');

  useEffect(() => {
    const getAsteroids = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedAsteroids = await fetchPotentiallyHazardousAsteroids();
        setAsteroids(fetchedAsteroids);
      } catch (err) {
        setError('Failed to fetch asteroid data from NASA. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    getAsteroids();
  }, []);

  const handleAsteroidSelect = useCallback((asteroidId: string) => {
    const asteroid = asteroids.find(a => a.id === asteroidId);
    setSelectedAsteroid(asteroid || null);
  }, [asteroids]);

  const handleCustomAsteroid = useCallback((asteroid: Asteroid) => {
    setSelectedAsteroid(asteroid);
    setIsModalOpen(false);
  }, []);

  const handleMapClick = useCallback((latlng: LatLng) => {
    setImpactLocation(latlng);
  }, []);

  const handleLaunch = useCallback(() => {
    if (selectedAsteroid && impactLocation) {
      const results = calculateImpact(selectedAsteroid, impactTarget);
      setImpactResults(results);
    }
  }, [selectedAsteroid, impactLocation, impactTarget]);

  const handleReset = useCallback(() => {
    setImpactLocation(null);
    setImpactResults(null);
  }, []);

  return (
    <div className="relative h-screen w-screen text-slate-200 overflow-hidden flex flex-col md:flex-row">
      <div className="w-full md:w-96 bg-slate-900/80 backdrop-blur-sm border-r border-slate-700 p-4 flex flex-col space-y-4 z-20 overflow-y-auto">
        <h1 className="text-3xl font-bold text-orange-400 text-center">Asteroid Simulator</h1>
        <ControlPanel
          asteroids={asteroids}
          selectedAsteroid={selectedAsteroid}
          impactLocation={impactLocation}
          onAsteroidSelect={handleAsteroidSelect}
          onLaunch={handleLaunch}
          onReset={handleReset}
          isLoading={isLoading}
          error={error}
          onOpenCustomModal={() => setIsModalOpen(true)}
          impactTarget={impactTarget}
          setImpactTarget={setImpactTarget}
        />
        {impactResults && <ResultsPanel results={impactResults} />}
      </div>

      <div className="flex-grow h-full w-full z-10">
        <MapDisplay
          impactLocation={impactLocation}
          impactResults={impactResults}
          onMapClick={handleMapClick}
        />
      </div>

      {isModalOpen && (
        <CustomAsteroidModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCustomAsteroid}
        />
      )}
    </div>
  );
};

export default App;
