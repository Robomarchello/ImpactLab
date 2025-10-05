import './leaflet-fix';

import React, { useState, useEffect, useCallback } from 'react';
import { LatLngTuple } from 'leaflet';
import MapComponent from './components/MapComponent';
import Sidebar from './components/Sidebar';
import { fetchAsteroids } from './services/nasaApi';
import { Asteroid, ImpactResult } from './types';
import { calculateImpact } from './services/impactCalculator';

export default function App() {
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(null);
  const [impactLocation, setImpactLocation] = useState<LatLngTuple | null>(null);
  const [simulationResult, setSimulationResult] = useState<ImpactResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOceanImpact, setIsOceanImpact] = useState<boolean>(false);

  useEffect(() => {
    const loadAsteroids = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const startDate = sevenDaysAgo.toISOString().split('T')[0];
        const endDate = new Date().toISOString().split('T')[0];
        
        const fetchedAsteroids = await fetchAsteroids(startDate, endDate);
        setAsteroids(fetchedAsteroids);
      } catch (err) {
        setError('Failed to fetch asteroid data from NASA. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAsteroids();
  }, []);

  const handleLaunch = useCallback(() => {
    if (!selectedAsteroidId || !impactLocation) {
      alert('Please select an asteroid and an impact location on the map.');
      return;
    }
    const selectedAsteroid = asteroids.find(a => a.id === selectedAsteroidId);
    if (selectedAsteroid) {
      const result = calculateImpact(selectedAsteroid, isOceanImpact);
      setSimulationResult(result);
    }
  }, [selectedAsteroidId, impactLocation, asteroids, isOceanImpact]);

  const handleReset = useCallback(() => {
    setImpactLocation(null);
    setSimulationResult(null);
    setSelectedAsteroidId(null);
  }, []);

  return (
    <div className="flex h-screen w-screen font-sans text-white bg-gray-900 overflow-hidden">
      <Sidebar
        asteroids={asteroids}
        selectedAsteroidId={selectedAsteroidId}
        onSelectAsteroid={setSelectedAsteroidId}
        onLaunch={handleLaunch}
        onReset={handleReset}
        isLoading={isLoading}
        error={error}
        impactResult={simulationResult}
        isOceanImpact={isOceanImpact}
        setIsOceanImpact={setIsOceanImpact}
        hasSelection={!!impactLocation && !!selectedAsteroidId}
      />
      <main className="flex-1 h-full">
        <MapComponent
          impactLocation={impactLocation}
          setImpactLocation={setImpactLocation}
          impactResult={simulationResult}
        />
      </main>
    </div>
  );
}
