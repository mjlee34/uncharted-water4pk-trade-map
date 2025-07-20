export interface City {
  name: string;
  culture: string;
  region_code: string;
  coordinates: {
    lat: number;
    lng: number;
    display: string;
  };
  development: number;
  military: number;
  specialties: string[];
  type: string;
}

export interface Item {
  name: string;
  category: string;
  prices: Record<string, number>;
}

export interface Region {
  name: string;
  display: string;
}

export interface TradeDatabase {
  metadata: {
    title: string;
    description: string;
    version: string;
    created: string;
  };
  regions: Record<string, Region>;
  categories: string[];
  cities: City[];
  items: Item[];
}

export interface BestPriceCity {
  city: City;
  price: number;
} 