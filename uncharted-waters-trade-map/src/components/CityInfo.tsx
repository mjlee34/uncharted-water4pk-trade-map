import React from 'react';
import type { City, Item } from '../types';

interface CityInfoProps {
  city: City;
  items: Item[];
  onItemSelect: (item: Item) => void;
}

const CityInfo: React.FC<CityInfoProps> = ({ city, items, onItemSelect }) => {
  const handleSpecialtyClick = (specialtyName: string) => {
    const item = items.find(it => it.name === specialtyName);
    if (item) {
      onItemSelect(item);
    }
  };

  return (
    <div className="p-1">
      <h3 className="font-bold text-lg mb-2 text-gray-800">{city.name}</h3>
      <div className="space-y-1.5 text-sm text-gray-600">
        <p><span className="font-semibold text-gray-700">문화권:</span> {city.culture || '없음'}</p>
        <p><span className="font-semibold text-gray-700">발전도:</span> {city.development.toLocaleString()}</p>
        <p><span className="font-semibold text-gray-700">무장도:</span> {city.military.toLocaleString()}</p>
        <p><span className="font-semibold text-gray-700">타입:</span> {city.type || '일반'}</p>
        {city.specialties && city.specialties.length > 0 && (
          <div>
            <span className="font-semibold text-gray-700">특산품:</span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {city.specialties.map((specialty, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSpecialtyClick(specialty)}
                  className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CityInfo;
