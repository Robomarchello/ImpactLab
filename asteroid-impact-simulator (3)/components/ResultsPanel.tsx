
import React from 'react';
import type { ImpactResults } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsPanelProps {
  results: ImpactResults;
}

const formatNumber = (num: number, digits = 2) => {
    if (num === 0) return '0';
    if (num < 1) return num.toFixed(digits);
    return num.toLocaleString('en-US', { maximumFractionDigits: digits });
};

const energyData = [
    { name: 'Hiroshima', value: 0.015, color: '#4ade80' },
    { name: 'Tsar Bomba', value: 50, color: '#facc15' },
    { name: 'Chicxulub', value: 100000000, color: '#f87171' },
];

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  const impactEnergyData = [...energyData, { name: 'Your Impact', value: results.energy, color: '#f97316' }]
    .sort((a,b) => a.value - b.value);

  return (
    <div className="bg-slate-800/50 p-4 rounded-md border border-slate-700 flex flex-col space-y-4 text-sm">
        <h2 className="text-xl font-bold text-orange-400">Impact Analysis</h2>

        <div>
            <h3 className="font-bold text-slate-300">Impact Energy</h3>
            <p className="text-orange-300 text-lg font-semibold">{formatNumber(results.energy)} Megatons of TNT</p>
            <div style={{width: '100%', height: 150}}>
                 <ResponsiveContainer>
                    <BarChart data={impactEnergyData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <XAxis type="number" scale="log" domain={[0.001, 1e9]} tick={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={80} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{fill: 'rgba(255,255,255,0.1)'}}
                            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem' }} 
                            formatter={(value: number) => [`${formatNumber(value)} MT`, 'Energy']}
                        />
                        <Bar dataKey="value" >
                             {impactEnergyData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                 </ResponsiveContainer>
            </div>
        </div>

        {results.craterDiameter > 0 && (
            <div>
                <h3 className="font-bold text-slate-300">Crater</h3>
                <p>Diameter: <span className="text-orange-300">{formatNumber(results.craterDiameter / 1000)} km</span></p>
                <p>Depth: <span className="text-orange-300">{formatNumber(results.craterDepth / 1000)} km</span></p>
            </div>
        )}
        
        {results.tsunami.isTsunami && (
            <div className="bg-blue-900/50 p-2 rounded-md border border-blue-700">
                <h3 className="font-bold text-blue-300">Tsunami Generated!</h3>
                <p>Initial Wave Height at 100km: <span className="text-blue-200 text-lg">{formatNumber(results.tsunami.waveHeight)} meters</span></p>
            </div>
        )}

        <div>
            <h3 className="font-bold text-slate-300">Destruction Radii (from impact point)</h3>
            <ul className="list-none space-y-1 mt-1">
                <li className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#7c2d12'}}></div>Fireball: {formatNumber(results.fireballRadius/1000)} km</li>
                <li className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#c2410c'}}></div>Heavy Damage (20 PSI): {formatNumber(results.shockwave.psi20/1000)} km</li>
                <li className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#ea580c'}}></div>Building Collapse (5 PSI): {formatNumber(results.shockwave.psi5/1000)} km</li>
                <li className="flex items-center"><div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: '#f97316'}}></div>Window Damage (1 PSI): {formatNumber(results.shockwave.psi1/1000)} km</li>
            </ul>
        </div>
    </div>
  );
};

export default ResultsPanel;
