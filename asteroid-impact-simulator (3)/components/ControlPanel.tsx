
import React from 'react';
import type { Asteroid, ImpactTarget } from '../types';

interface ControlPanelProps {
  asteroids: Asteroid[];
  selectedAsteroid: Asteroid | null;
  impactLocation: any;
  onAsteroidSelect: (id: string) => void;
  onLaunch: () => void;
  onReset: () => void;
  isLoading: boolean;
  error: string | null;
  onOpenCustomModal: () => void;
  impactTarget: ImpactTarget;
  setImpactTarget: (target: ImpactTarget) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  asteroids,
  selectedAsteroid,
  impactLocation,
  onAsteroidSelect,
  onLaunch,
  onReset,
  isLoading,
  error,
  onOpenCustomModal,
  impactTarget,
  setImpactTarget
}) => {
  return (
    <div className="flex flex-col space-y-4">
      <div>
        <label htmlFor="asteroid-select" className="block text-sm font-medium text-slate-300 mb-1">
          1. Choose a Potentially Hazardous Asteroid
        </label>
        {isLoading && <p className="text-orange-400">Loading asteroid data...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <select
            id="asteroid-select"
            className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
            onChange={(e) => onAsteroidSelect(e.target.value)}
            value={selectedAsteroid?.id || ''}
          >
            <option value="" disabled>Select an asteroid</option>
            {asteroids.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} (~{a.diameter_meters.toFixed(0)}m)
              </option>
            ))}
          </select>
        )}
        <button
          onClick={onOpenCustomModal}
          className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Or... Create Your Own
        </button>
      </div>
      
      {selectedAsteroid && (
        <div className="bg-slate-800 p-3 rounded-md border border-slate-700 text-sm">
          <h3 className="font-bold text-orange-400">{selectedAsteroid.name}</h3>
          <p>Diameter: {selectedAsteroid.diameter_meters.toFixed(0)} meters</p>
          <p>Velocity: {selectedAsteroid.relative_velocity_kph.toLocaleString('en-US', { maximumFractionDigits: 0 })} km/h</p>
          <p className="text-red-400">{selectedAsteroid.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : ''}</p>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-slate-300 mb-1">
          2. Pick an Impact Location
        </h2>
        <div className="w-full bg-slate-800 border border-slate-600 rounded-md p-2 text-center h-10 flex items-center justify-center">
            <p className={impactLocation ? 'text-green-400' : 'text-slate-400'}>
                {impactLocation ? 'Location Selected!' : 'Click on the map...'}
            </p>
        </div>
      </div>
      
       <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">3. Select Impact Surface</label>
        <div className="flex items-center space-x-2 bg-slate-800 border border-slate-600 rounded-md p-1">
          <button 
            onClick={() => setImpactTarget('land')}
            className={`w-1/2 rounded-md py-1 text-sm font-medium transition-colors ${impactTarget === 'land' ? 'bg-orange-600 text-white' : 'hover:bg-slate-700'}`}>
            Land
          </button>
          <button 
            onClick={() => setImpactTarget('ocean')}
            className={`w-1/2 rounded-md py-1 text-sm font-medium transition-colors ${impactTarget === 'ocean' ? 'bg-orange-600 text-white' : 'hover:bg-slate-700'}`}>
            Ocean
          </button>
        </div>
      </div>


      <div className="flex flex-col space-y-2 pt-2">
        <button
          onClick={onLaunch}
          disabled={!selectedAsteroid || !impactLocation}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md text-lg transition duration-300"
        >
          LAUNCH
        </button>
        <button
          onClick={onReset}
          className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold py-2 px-4 rounded-md transition duration-300"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
