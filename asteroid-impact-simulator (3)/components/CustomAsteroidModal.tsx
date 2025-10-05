
import React, { useState } from 'react';
import type { Asteroid } from '../types';

interface CustomAsteroidModalProps {
  onClose: () => void;
  onSubmit: (asteroid: Asteroid) => void;
}

const CustomAsteroidModal: React.FC<CustomAsteroidModalProps> = ({ onClose, onSubmit }) => {
  const [diameter, setDiameter] = useState(100);
  const [velocity, setVelocity] = useState(72000);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isHazardous = diameter >= 140; // Simplified hazard check
    const customAsteroid: Asteroid = {
      id: `custom-${Date.now()}`,
      name: `Custom Asteroid`,
      diameter_meters: diameter,
      relative_velocity_kph: velocity,
      is_potentially_hazardous_asteroid: isHazardous,
    };
    onSubmit(customAsteroid);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-lg p-8 shadow-2xl border border-slate-600 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-orange-400">Create a Custom Asteroid</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="diameter" className="block text-sm font-medium text-slate-300">
              Diameter (meters)
            </label>
            <input
              type="number"
              id="diameter"
              value={diameter}
              onChange={(e) => setDiameter(Math.max(1, Number(e.target.value)))}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
              min="1"
            />
            <p className="text-xs text-slate-400 mt-1">
                {diameter >= 140 
                    ? <span className="text-red-400">This size is considered potentially hazardous.</span> 
                    : "Below the general threshold for 'Potentially Hazardous'."
                }
            </p>
          </div>
          <div>
            <label htmlFor="velocity" className="block text-sm font-medium text-slate-300">
              Relative Velocity (km/h)
            </label>
            <input
              type="number"
              id="velocity"
              value={velocity}
              onChange={(e) => setVelocity(Math.max(1000, Number(e.target.value)))}
              className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
              min="1000"
            />
            <p className="text-xs text-slate-400 mt-1">Average is ~72,000 km/h for near-Earth asteroids.</p>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 text-slate-200 font-bold py-2 px-4 rounded-md transition duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-md transition duration-300"
            >
              Create & Use
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomAsteroidModal;
