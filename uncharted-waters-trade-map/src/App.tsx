import { useState } from 'react';
import './App.css';
import TradeMap from './components/TradeMap';
import InfoPanel from './components/InfoPanel';
import { useTradeData } from './hooks/useTradeData';

function App() {
  const {
    cities,
    items,
    selectedCity,
    selectedItem,
    citiesWithPrices,
    handleCitySelect: originalHandleCitySelect,
    handleItemSelect,
  } = useTradeData();

  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);

  const handleCitySelect = (city: (typeof cities)[0]) => {
    originalHandleCitySelect(city);
    setIsInfoPanelOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col font-sans">
      <header className="bg-white shadow-md z-20 text-center p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center">
          대항해시대4 PK 교역 도우미
        </h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-grow h-full relative">
        <TradeMap
          cities={cities}
          selectedCity={selectedCity}
          bestPriceCities={citiesWithPrices}
          onCitySelect={handleCitySelect}
        />
      </main>

      {isInfoPanelOpen && (
        <InfoPanel
          selectedCity={selectedCity}
          selectedItem={selectedItem}
          items={items}
          onItemSelect={handleItemSelect}
          onClose={() => setIsInfoPanelOpen(false)}
        />
      )}
      </div>
    </div>
  );
}

export default App;
