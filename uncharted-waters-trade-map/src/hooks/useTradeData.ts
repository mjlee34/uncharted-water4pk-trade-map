import { useState, useEffect, useCallback } from 'react';
import type { City, Item, BestPriceCity, TradeDatabase } from '../types';
import db from '../data/trade_database.json';

const database: TradeDatabase = db;

export const useTradeData = () => {
  const { cities, items } = database;
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [citiesWithPrices, setCitiesWithPrices] = useState<BestPriceCity[]>([]);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setSelectedItem(null); // 도시를 선택하면 아이템 선택은 초기화
    setCitiesWithPrices([]);
  };

  const findItemPrices = useCallback(() => {
    if (!selectedItem) {
      setCitiesWithPrices([]);
      return;
    }

    const pricesByCulture: { [key: string]: number } = selectedItem.prices;
    const newCitiesWithPrices = cities
      .map(city => ({
        city,
        price: pricesByCulture[city.culture] || 0,
      }))
      .filter(d => d.price > 0)
      .sort((a, b) => b.price - a.price); // 여전히 정렬은 유지 (나중에 유용할 수 있음)

    setCitiesWithPrices(newCitiesWithPrices);
  }, [selectedItem, cities]);

  useEffect(() => {
    findItemPrices();
  }, [findItemPrices]);

  const handleItemSelect = (item: Item | null) => {
    setSelectedItem(item);
  };

  const clearSelection = () => {
    setSelectedCity(null);
    setSelectedItem(null);
    setCitiesWithPrices([]);
  };

  return {
    cities,
    items,
    selectedCity,
    selectedItem,
    citiesWithPrices, // bestPriceCities 대신 이걸로 변경
    handleCitySelect,
    handleItemSelect,
    clearSelection,
  };
};