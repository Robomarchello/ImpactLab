
import React, { useState, useCallback } from 'react';
import type { LatLng } from 'leaflet';
import ControlPanel from './components/ControlPanel';
import MapDisplay from './components/MapDisplay';
import ResultsPanel from './components/ResultsPanel';
import type { AsteroidParams, ImpactData, SimulationResult } from './types';
import { ASTEROID_DENSITIES } from './constants';
import { calculateImpact } from './services/impactCalculator';
import { generateImpactSummary } from './services/geminiService';

const App: React.FC = () => {
  const [asteroidParams, setAsteroidParams] = useState<AsteroidParams>({
    diameter: 100, // meters
    speed: 20, // km/s
    angle: 45, // degrees
    density: 'STONE',
    isOceanImpact: false,
  });
  const [impactLocation, setImpactLocation] = useState<LatLng | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<SimulationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLaunch = useCallback(async () => {
    if (!impactLocation) {
      alert('Please select an impact location on the map.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const impactData: ImpactData = calculateImpact(asteroidParams, ASTEROID_DENSITIES[asteroidParams.density]);
      const summary = await generateImpactSummary(impactData, impactLocation);
      
      const newResult: SimulationResult = {
        id: new Date().getTime(),
        location: impactLocation,
        data: impactData,
        summary: summary,
      };
      
      setSimulationHistory(prev => [...prev, newResult]);
    } catch (error) {
      console.error("Failed to run simulation:", error);
      alert("An error occurred during the simulation. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, [impactLocation, asteroidParams]);

  const handleReset = useCallback(() => {
    setSimulationHistory([]);
    setImpactLocation(null);
  }, []);

  const latestResult = simulationHistory.length > 0 ? simulationHistory[simulationHistory.length - 1] : null;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200 font-sans">
      <div className="w-full md:w-1/3 xl:w-1/4 p-4 overflow-y-auto bg-gray-800 shadow-2xl flex flex-col">
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-red-500 mb-2">Asteroid Launcher</h1>
          <p className="text-gray-400 mb-6">Configure the asteroid's properties, select a target on the map, and witness the devastation.</p>
          <ControlPanel
            params={asteroidParams}
            setParams={setAsteroidParams}
            onLaunch={handleLaunch}
            onReset={handleReset}
            isLoading={isLoading}
            isLocationSet={!!impactLocation}
          />
          {latestResult && <ResultsPanel result={latestResult} />}
          {!latestResult && (
             <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-bold text-lg text-yellow-400">Awaiting Impact</h3>
                <p className="text-gray-300 mt-2">
                  Set the parameters for your asteroid, click a location on the map to set the target, and press 'Launch Asteroid' to begin the simulation.
                </p>
             </div>
          )}
        </div>
      </div>
      <div className="flex-grow h-full w-full md:w-2/3 xl:w-3/4">
        <MapDisplay
          impactLocation={impactLocation}
          setImpactLocation={setImpactLocation}
          simulationHistory={simulationHistory}
        />
      </div>
    </div>
  );
};

export default App;
