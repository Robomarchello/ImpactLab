
import React from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, Popup } from 'react-leaflet';
import { LatLngTuple } from 'leaflet';
import { ImpactResult } from '../types';

interface MapComponentProps {
  impactLocation: LatLngTuple | null;
  setImpactLocation: (location: LatLngTuple) => void;
  impactResult: ImpactResult | null;
}

const LocationSetter = ({ setImpactLocation }: { setImpactLocation: (location: LatLngTuple) => void }) => {
  useMapEvents({
    click(e) {
      setImpactLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ impactLocation, setImpactLocation, impactResult }) => {
  const shockwaveColor = "#ff7800";
  const fireballColor = "#f03";
  const craterColor = "#4a5568";

  return (
    <MapContainer center={[20, 0]} zoom={3} scrollWheelZoom={true} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationSetter setImpactLocation={setImpactLocation} />

      {impactLocation && <Marker position={impactLocation}>
          <Popup>Impact Location</Popup>
        </Marker>
      }

      {impactLocation && impactResult && (
        <>
          <Circle center={impactLocation} pathOptions={{ color: shockwaveColor, fillColor: shockwaveColor }} radius={impactResult.shockwave.lightDamageRadius}>
             <Popup>Light Damage Radius ({ (impactResult.shockwave.lightDamageRadius / 1000).toFixed(1) } km)</Popup>
          </Circle>
          <Circle center={impactLocation} pathOptions={{ color: shockwaveColor, fillColor: shockwaveColor }} radius={impactResult.shockwave.moderateDamageRadius}>
            <Popup>Moderate Damage Radius ({ (impactResult.shockwave.moderateDamageRadius / 1000).toFixed(1) } km)</Popup>
          </Circle>
           <Circle center={impactLocation} pathOptions={{ color: shockwaveColor, fillColor: shockwaveColor }} radius={impactResult.shockwave.severeDamageRadius}>
            <Popup>Severe Damage Radius ({ (impactResult.shockwave.severeDamageRadius / 1000).toFixed(1) } km)</Popup>
          </Circle>
          <Circle center={impactLocation} pathOptions={{ color: fireballColor, fillColor: fireballColor }} radius={impactResult.fireballRadius}>
             <Popup>Fireball Radius ({ (impactResult.fireballRadius / 1000).toFixed(1) } km)</Popup>
          </Circle>
          {impactResult.craterDiameter > 0 && (
            <Circle center={impactLocation} pathOptions={{ color: craterColor, fillColor: craterColor }} radius={impactResult.craterDiameter / 2}>
              <Popup>Crater Diameter ({ (impactResult.craterDiameter * 2 / 1000).toFixed(1) } km)</Popup>
            </Circle>
          )}
        </>
      )}
    </MapContainer>
  );
};

export default MapComponent;
