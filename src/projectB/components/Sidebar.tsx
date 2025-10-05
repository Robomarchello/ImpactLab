
import React from 'react';
import { Asteroid, ImpactResult } from '../types';
import ImpactResultCard from './ImpactResultCard';
import { FireIcon, GlobeIcon, ResetIcon, TsunamiIcon, CraterIcon, ZapIcon } from './Icons';

interface SidebarProps {
  asteroids: Asteroid[];
  selectedAsteroidId: string | null;
  onSelectAsteroid: (id: string) => void;
  onLaunch: () => void;
  onReset: () => void;
  isLoading: boolean;
  error: string | null;
  impactResult: ImpactResult | null;
  isOceanImpact: boolean;
  setIsOceanImpact: (value: boolean) => void;
  hasSelection: boolean;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const {
    asteroids,
    selectedAsteroidId,
    onSelectAsteroid,
    onLaunch,
    onReset,
    isLoading,
    error,
    impactResult,
    isOceanImpact,
    setIsOceanImpact,
    hasSelection
  } = props;

  const selectedAsteroid = asteroids.find(a => a.id === selectedAsteroidId);

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toFixed(1);
    if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
    return `${(num / 1000000).toFixed(1)}M`;
  };


  return (
    <aside className="w-96 h-screen bg-gray-900/80 backdrop-blur-sm text-gray-200 p-6 flex flex-col space-y-4 overflow-y-auto border-r border-gray-700 shadow-2xl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-orange-400">Asteroid Launcher</h1>
        <button onClick={onReset} className="p-2 rounded-full hover:bg-gray-700 transition-colors" title="Reset Simulation">
          <ResetIcon />
        </button>
      </div>
      
      <div className="flex-grow flex flex-col space-y-4">
        {/* Controls */}
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Simulation Setup</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="asteroid-select" className="block text-sm font-medium text-gray-400 mb-1">1. Choose Asteroid</label>
              {isLoading && <div className="text-sm text-gray-400">Loading asteroids...</div>}
              {error && <div className="text-sm text-red-400">{error}</div>}
              {!isLoading && !error && (
                <select
                  id="asteroid-select"
                  value={selectedAsteroidId ?? ''}
                  onChange={(e) => onSelectAsteroid(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-orange-500 focus:border-orange-500 transition"
                >
                  <option value="" disabled>Select an object</option>
                  {asteroids.map(a => (
                    <option key={a.id} value={a.id}>{a.name} (~{(a.diameter).toFixed(0)}m)</option>
                  ))}
                </select>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-400">2. Click on the map to set impact location.</div>

            <div className="relative flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="ocean-impact"
                  type="checkbox"
                  checked={isOceanImpact}
                  onChange={(e) => setIsOceanImpact(e.target.checked)}
                  className="focus:ring-orange-500 h-4 w-4 text-orange-600 bg-gray-700 border-gray-600 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="ocean-impact" className="font-medium text-gray-300">Impact in Ocean?</label>
              </div>
            </div>
          </div>
        </div>

        {selectedAsteroid && (
             <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 text-sm">
                <h3 className="font-bold text-lg mb-2 text-orange-400">{selectedAsteroid.name}</h3>
                <p><span className="font-semibold text-gray-400">Avg. Diameter:</span> {selectedAsteroid.diameter.toFixed(1)} meters</p>
                <p><span className="font-semibold text-gray-400">Velocity:</span> {selectedAsteroid.velocity.toFixed(1)} km/s</p>
                {selectedAsteroid.isPotentiallyHazardous && <p className="text-red-400 mt-2 font-semibold">Potentially Hazardous</p>}
             </div>
        )}

        <button 
          onClick={onLaunch}
          disabled={!hasSelection}
          className="w-full py-3 px-4 text-lg font-bold text-white bg-orange-600 rounded-lg shadow-md hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:scale-100"
        >
          Launch Asteroid
        </button>

        {/* Results */}
        {impactResult && (
          <div className="space-y-3 pt-4 border-t border-gray-700">
            <h2 className="text-xl font-semibold text-gray-300">Impact Assessment</h2>
            <ImpactResultCard icon={<ZapIcon />} title="Impact Energy" value={`${formatNumber(impactResult.energy)} Megatons`} description="Equivalent TNT" />
            
            {impactResult.tsunami.isTsunami ? (
              <ImpactResultCard icon={<TsunamiIcon />} title="Tsunami Wave" value={`${formatNumber(impactResult.tsunami.waveHeight)} meters`} description="Initial wave height near impact" />
            ) : (
              <ImpactResultCard icon={<CraterIcon />} title="Crater Diameter" value={`${formatNumber(impactResult.craterDiameter)} meters`} description="Final crater size" />
            )}

            <ImpactResultCard icon={<FireIcon />} title="Fireball Radius" value={`${formatNumber(impactResult.fireballRadius)} meters`} description="Third-degree burns" />
            
            <ImpactResultCard icon={<GlobeIcon />} title="Shockwave Damage" description="Air blast effects">
               <div className="text-xs space-y-1 mt-2 text-gray-400">
                 <p>Light ({formatNumber(impactResult.shockwave.lightDamageRadius)} m): Windows shatter</p>
                 <p>Moderate ({formatNumber(impactResult.shockwave.moderateDamageRadius)} m): Buildings collapse</p>
                 <p>Severe ({formatNumber(impactResult.shockwave.severeDamageRadius)} m): Total destruction</p>
               </div>
            </ImpactResultCard>
          </div>
        )}

        {!impactResult && (
            <div className="flex-grow flex items-center justify-center text-center text-gray-500">
                <p>Awaiting simulation launch...</p>
            </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
