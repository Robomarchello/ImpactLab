
import React from 'react';
import { MapContainer, TileLayer, Circle, useMapEvents, Marker, Popup } from 'react-leaflet';
import type { LatLng } from 'leaflet';
import type { ImpactResults } from '../types';

interface MapDisplayProps {
  impactLocation: LatLng | null;
  impactResults: ImpactResults | null;
  onMapClick: (latlng: LatLng) => void;
}

const MapEventsHandler: React.FC<{ onClick: (latlng: LatLng) => void }> = ({ onClick }) => {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
};

const MapDisplay: React.FC<MapDisplayProps> = ({ impactLocation, impactResults, onMapClick }) => {
  const mapCenter: [number, number] = [20, 0];
  
  const circles = impactResults && impactLocation ? [
      { radius: impactResults.shockwave.psi1, color: '#f97316', opacity: 0.2, label: 'Window Damage' },
      { radius: impactResults.shockwave.psi5, color: '#ea580c', opacity: 0.3, label: 'Building Collapse' },
      { radius: impactResults.shockwave.psi20, color: '#c2410c', opacity: 0.4, label: 'Heavy Damage' },
      { radius: impactResults.fireballRadius, color: '#9a3412', opacity: 0.6, label: 'Fireball' },
      { radius: impactResults.craterDiameter / 2, color: '#7c2d12', opacity: 0.8, label: 'Crater' },
  ] : [];

  return (
    <MapContainer center={mapCenter} zoom={3} style={{ height: '100%', width: '100%' }} minZoom={2} maxBounds={[[-90, -180], [90, 180]]}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <MapEventsHandler onClick={onMapClick} />
      {impactLocation && !impactResults && <Marker position={impactLocation}></Marker>}

      {impactLocation && impactResults && circles.map((circle, index) => (
         circle.radius > 0 &&
         <Circle
            key={index}
            center={impactLocation}
            radius={circle.radius}
            pathOptions={{ color: circle.color, fillColor: circle.color, fillOpacity: circle.opacity, weight: 1 }}
        >
            <Popup>{circle.label}: {(circle.radius / 1000).toFixed(2)} km radius</Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default MapDisplay;
