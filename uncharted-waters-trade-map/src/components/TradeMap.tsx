import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { divIcon } from 'leaflet';
import type { City, BestPriceCity } from '../types';
import 'leaflet/dist/leaflet.css';

// 커스텀 아이콘 생성
const createCustomIcon = (color: string, price?: number) => {
  const priceHtml = price ? `<div class="price-label">${price}</div>` : '';
  return divIcon({
    html: `<div class="marker-pin" style="background-color: ${color};"></div>${priceHtml}`,
    iconSize: [40, 42],
    iconAnchor: [20, 42],
    popupAnchor: [0, -32],
    className: 'custom-div-icon'
  });
};

interface TradeMapProps {
  cities: City[];
  selectedCity: City | null;
  bestPriceCities: BestPriceCity[];
  onCitySelect: (city: City) => void;
}

const TradeMap: React.FC<TradeMapProps> = ({
  cities,
  selectedCity,
  bestPriceCities,
  onCitySelect,
}) => {
  const priceMap = new Map(bestPriceCities.map(bp => [bp.city.name, bp.price]));

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[20, 0]}
        zoom={3}
        style={{ height: '100%', width: '100%', backgroundColor: '#a2d3f5' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {cities.map(city => {
          const isSelected = selectedCity?.name === city.name;
          const price = priceMap.get(city.name);
          
          let icon;
          if (isSelected) {
            icon = createCustomIcon('#ff4b5c', price); // 빨간색 (선택됨)
          } else if (price) {
            icon = createCustomIcon('#28a745', price); // 녹색 (가격 있음)
          } else {
            icon = createCustomIcon('#007bff'); // 파란색 (기본)
          }

          return (
            <Marker
              key={`${city.name}-${isSelected}-${price}`}
              position={[city.coordinates.lat, city.coordinates.lng]}
              icon={icon}
              eventHandlers={{
                click: () => onCitySelect(city),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TradeMap; 