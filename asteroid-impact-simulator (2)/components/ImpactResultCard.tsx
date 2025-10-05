
import React from 'react';

interface ImpactResultCardProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  description: string;
  children?: React.ReactNode;
}

const ImpactResultCard: React.FC<ImpactResultCardProps> = ({ icon, title, value, description, children }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-start space-x-4">
      <div className="text-orange-400 mt-1">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-300">{title}</h3>
        {value && <p className="text-2xl font-bold text-white">{value}</p>}
        <p className="text-xs text-gray-500">{description}</p>
        {children}
      </div>
    </div>
  );
};

export default ImpactResultCard;
