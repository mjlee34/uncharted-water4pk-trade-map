import React from 'react';
import { X, Compass } from 'lucide-react';
import type { City, Item } from '../types';

interface InfoPanelProps {
  selectedCity: City | null;
  selectedItem: Item | null;
  items: Item[];
  onItemSelect: (item: Item | null) => void;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedCity, selectedItem, items, onItemSelect, onClose }) => {
  return (
    <aside className="w-96 flex-shrink-0 bg-slate-50 shadow-lg p-4 flex flex-col z-10 border-l border-slate-200">
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          <Compass className="w-6 h-6 mr-2 text-indigo-600"/> 
          <span>정보 패널</span>
        </h2>
        <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 -mr-2">
        {selectedItem && (
          <div className='mb-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm'>
            <h3 className='text-md font-bold text-indigo-700'>선택된 교역품: {selectedItem.name}</h3>
            <p className='text-sm text-slate-500 mt-1'>지도에 도시별 매입가가 표시됩니다.</p>
            <button onClick={() => onItemSelect(null)} className='text-xs font-semibold text-red-600 hover:text-red-800 mt-3 transition-colors'>
              교역품 선택 해제
            </button>
          </div>
        )}

        {selectedCity ? (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-2xl font-bold text-slate-800">{selectedCity.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{selectedCity.culture} 문화권</p>
                
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex justify-between items-baseline"><span className="font-medium text-slate-500">발전도</span><span className="font-mono text-slate-900">{selectedCity.development.toLocaleString()}</span></li>
                  <li className="flex justify-between items-baseline"><span className="font-medium text-slate-500">무장도</span><span className="font-mono text-slate-900">{selectedCity.military.toLocaleString()}</span></li>
                  <li className="flex justify-between items-baseline"><span className="font-medium text-slate-500">도시 타입</span><span className="font-semibold text-slate-900">{selectedCity.type}</span></li>
                </ul>
            </div>

            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="text-lg font-bold text-slate-800 mb-3">특산품 목록</h4>
              {selectedCity.specialties.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCity.specialties.map(specialty => (
                    <button 
                      key={specialty}
                      onClick={() => {
                      const item = items.find(i => i.name === specialty);
                      if (item) onItemSelect(item);
                    }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-sm font-medium hover:bg-indigo-100 hover:text-indigo-800 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">이 도시에는 특산품이 없습니다.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 pt-20">
            <p className="font-semibold text-slate-600">도시를 선택하세요</p>
            <p className="text-sm mt-1">지도에서 도시를 클릭하면<br/>상세 정보를 볼 수 있습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default InfoPanel;
