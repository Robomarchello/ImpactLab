
import React from 'react';
import type { AsteroidParams, AsteroidMaterial } from '../types';

interface ControlPanelProps {
  params: AsteroidParams;
  setParams: React.Dispatch<React.SetStateAction<AsteroidParams>>;
  onLaunch: () => void;
  onReset: () => void;
  isLoading: boolean;
  isLocationSet: boolean;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-300 text-sm font-bold mb-2 flex justify-between">
      <span>{label}</span>
      <span className="text-yellow-400 font-mono">{value} {unit}</span>
    </label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-red-500"
    />
  </div>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  onLaunch,
  onReset,
  isLoading,
  isLocationSet,
}) => {
  const handleParamChange = <K extends keyof AsteroidParams,>(key: K, value: AsteroidParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <Slider
        label="Diameter"
        value={params.diameter}
        min={10}
        max={10000} // 10 km
        step={10}
        unit="m"
        onChange={e => handleParamChange('diameter', parseFloat(e.target.value))}
      />
      <Slider
        label="Speed"
        value={params.speed}
        min={10}
        max={100}
        step={1}
        unit="km/s"
        onChange={e => handleParamChange('speed', parseFloat(e.target.value))}
      />
      <Slider
        label="Angle"
        value={params.angle}
        min={5}
        max={90}
        step={1}
        unit="°"
        onChange={e => handleParamChange('angle', parseFloat(e.target.value))}
      />
      
      <div>
        <label className="block text-gray-300 text-sm font-bold mb-2">
          Density / Material
        </label>
        <select
          value={params.density}
          onChange={e => handleParamChange('density', e.target.value as AsteroidMaterial)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="IRON">Iron (8000 kg/m³)</option>
          <option value="STONE">Stone (3500 kg/m³)</option>
          <option value="CARBON">Carbonaceous (2200 kg/m³)</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
            type="checkbox"
            id="oceanImpact"
            checked={params.isOceanImpact}
            onChange={e => handleParamChange('isOceanImpact', e.target.checked)}
            className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
        />
        <label htmlFor="oceanImpact" className="ml-2 text-sm font-medium text-gray-300">
            Simulate Ocean Impact (for Tsunami)
        </label>
      </div>

      <div className="flex space-x-2 pt-4">
        <button
          onClick={onLaunch}
          disabled={isLoading || !isLocationSet}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'Launch Asteroid'
          )}
        </button>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
        >
          Reset
        </button>
      </div>
       {!isLocationSet && <p className="text-center text-yellow-400 text-sm mt-2">Click on the map to set a target!</p>}
    </div>
  );
};

export default ControlPanel;
