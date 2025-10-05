
import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import type { SimulationResult } from '../types';

interface MapDisplayProps {
  impactLocation: LatLng | null;
  setImpactLocation: (location: LatLng) => void;
  simulationHistory: SimulationResult[];
}

const MapEventsHandler: React.FC<{ setImpactLocation: (location: LatLng) => void }> = ({ setImpactLocation }) => {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setImpactLocation(e.latlng);
    },
  });
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ impactLocation, setImpactLocation, simulationHistory }) => {
  const colors = {
    crater: '#ff0000',     // Bright Red
    fireball: '#ffa500',   // Orange
    shockwave20psi: '#ffff00', // Yellow
    shockwave5psi: '#00ffff',  // Cyan
    shockwave1psi: '#0000ff',   // Blue
  };

  return (
    <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <MapEventsHandler setImpactLocation={setImpactLocation} />

      {impactLocation && <Marker position={impactLocation} />}

      {simulationHistory.map(result => (
        <React.Fragment key={result.id}>
          {/* Shockwave circles - render largest first */}
          <Circle center={result.location} radius={result.data.shockwave[2].radius * 1000} pathOptions={{ color: colors.shockwave1psi, fillColor: colors.shockwave1psi, fillOpacity: 0.2 }} />
          <Circle center={result.location} radius={result.data.shockwave[1].radius * 1000} pathOptions={{ color: colors.shockwave5psi, fillColor: colors.shockwave5psi, fillOpacity: 0.2 }} />
          <Circle center={result.location} radius={result.data.shockwave[0].radius * 1000} pathOptions={{ color: colors.shockwave20psi, fillColor: colors.shockwave20psi, fillOpacity: 0.2 }} />

          {/* Fireball */}
          <Circle center={result.location} radius={result.data.fireballRadius * 1000} pathOptions={{ color: colors.fireball, fillColor: colors.fireball, fillOpacity: 0.4 }} />

          {/* Crater */}
          <Circle center={result.location} radius={result.data.craterDiameter / 2 * 1000} pathOptions={{ color: colors.crater, fillColor: colors.crater, fillOpacity: 0.7 }} />
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapDisplay;
