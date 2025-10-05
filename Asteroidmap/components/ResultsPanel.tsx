
import React from 'react';
import type { SimulationResult } from '../types';

interface ResultsPanelProps {
  result: SimulationResult;
}

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <div className="flex items-center">
        <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
        <span>{label}</span>
    </div>
);

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  if (!result) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(2)}k`;
    return num.toFixed(2);
  };
  
  return (
    <div className="mt-6 p-4 bg-gray-700 rounded-lg animate-fade-in">
      <h3 className="font-bold text-lg text-red-400 mb-3">Impact Analysis</h3>
      
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div><strong>Energy:</strong> <span className="text-yellow-300">{formatNumber(result.data.energy)} MT</span></div>
        <div><strong>Crater Dia:</strong> <span className="text-yellow-300">{formatNumber(result.data.craterDiameter)} km</span></div>
        <div><strong>Fireball Rad:</strong> <span className="text-yellow-300">{formatNumber(result.data.fireballRadius)} km</span></div>
      </div>

      <div className="mb-4">
        <h4 className="font-bold text-base text-gray-300 mb-2">Shockwave Radius:</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          {result.data.shockwave.map((sw, index) => (
             <li key={index}><strong>{sw.overpressure} PSI:</strong> {formatNumber(sw.radius)} km <span className="text-gray-400">({sw.description})</span></li>
          ))}
        </ul>
      </div>

      {result.data.tsunamiWarning && (
          <div className="mb-4 p-3 bg-blue-900/50 border border-blue-500 rounded-lg">
              <h4 className="font-bold text-blue-300">Tsunami Alert</h4>
              <p className="text-sm text-blue-200">{result.data.tsunamiWarning}</p>
          </div>
      )}

       <div className="mb-4">
            <h4 className="font-bold text-base text-gray-300 mb-2">Map Legend:</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <LegendItem color="#ff0000" label="Crater" />
                <LegendItem color="#ffa500" label="Fireball" />
                <LegendItem color="#ffff00" label="20 PSI Shockwave" />
                <LegendItem color="#00ffff" label="5 PSI Shockwave" />
                <LegendItem color="#0000ff" label="1 PSI Shockwave" />
            </div>
        </div>

      <div>
        <h4 className="font-bold text-base text-gray-300 mb-2">Event Summary:</h4>
        <div className="p-3 bg-gray-800 rounded-md text-gray-300 text-sm whitespace-pre-wrap font-serif">
          {result.summary}
        </div>
      </div>

    </div>
  );
};

export default ResultsPanel;
