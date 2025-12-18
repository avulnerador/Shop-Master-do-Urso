import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Item, Shop, AppSettings, ShopType, SystemTag, ShopSettings, NPC, City } from '../../types';
import { INITIAL_ITEMS, INITIAL_NPCS, INITIAL_SHOP_TYPES, INITIAL_ITEM_TYPES, NPC_NAMES, NPC_RACES, NPC_TRAITS, FLAVOR_TEXTS } from '../../constants';

interface StoreContextType {
  allItems: Item[];
  savedShops: Shop[];
  cities: City[];
  npcs: NPC[]; // Global NPCs
  availableShopTypes: string[];
  availableItemTypes: string[];
  appSettings: AppSettings;
  currentShop: Shop | null;
  
  // Item CRUD
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  deleteItem: (id: string) => void;
  importItems: (items: Item[]) => void;
  
  // City CRUD
  addCity: (city: City) => void;
  deleteCity: (id: string) => void;

  // NPC CRUD
  addNPC: (npc: NPC) => void;
  updateNPC: (npc: NPC) => void;
  deleteNPC: (id: string) => void;

  // Type Management
  addShopType: (type: string) => void;
  deleteShopType: (type: string) => void;
  addItemType: (type: string) => void;
  deleteItemType: (type: string) => void;

  // Shop Logic
  generateShop: (types: ShopType[], systems: SystemTag[], minItems: number, maxItems: number, specificNPCId?: string, location?: string) => void;
  saveShop: (shop: Shop) => void;
  deleteShop: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateCurrentShop: (shop: Partial<Shop>) => void;
  loadShop: (id: string) => void;
  setLanguage: (lang: 'en' | 'pt' | 'es') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper to convert hex to rgb string "r g b"
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? 
    `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` 
    : '99 102 241';
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State Initialization
  const [allItems, setAllItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('rpg-shop-items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [cities, setCities] = useState<City[]>(() => {
    const saved = localStorage.getItem('rpg-shop-cities');
    return saved ? JSON.parse(saved) : [{ id: '1', name: 'Neverwinter' }, { id: '2', name: 'Waterdeep' }];
  });

  const [npcs, setNpcs] = useState<NPC[]>(() => {
    const saved = localStorage.getItem('rpg-shop-npcs');
    // If no NPCs saved, return the initial 5
    return saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : INITIAL_NPCS;
  });

  const [availableShopTypes, setAvailableShopTypes] = useState<string[]>(() => {
      const saved = localStorage.getItem('rpg-shop-types-shop');
      return saved ? JSON.parse(saved) : INITIAL_SHOP_TYPES;
  });

  const [availableItemTypes, setAvailableItemTypes] = useState<string[]>(() => {
      const saved = localStorage.getItem('rpg-shop-types-item');
      return saved ? JSON.parse(saved) : INITIAL_ITEM_TYPES;
  });

  const [savedShops, setSavedShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('rpg-shop-saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('rpg-shop-settings');
    return saved ? JSON.parse(saved) : {
      language: 'pt',
      primaryColor: '#6366f1', // Indigo 500
      secondaryColor: '#a855f7' // Purple 500
    };
  });

  const [currentShop, setCurrentShop] = useState<Shop | null>(null);

  // Persistence Effects
  useEffect(() => { localStorage.setItem('rpg-shop-items', JSON.stringify(allItems)); }, [allItems]);
  useEffect(() => { localStorage.setItem('rpg-shop-saved', JSON.stringify(savedShops)); }, [savedShops]);
  useEffect(() => { localStorage.setItem('rpg-shop-cities', JSON.stringify(cities)); }, [cities]);
  useEffect(() => { localStorage.setItem('rpg-shop-npcs', JSON.stringify(npcs)); }, [npcs]);
  useEffect(() => { localStorage.setItem('rpg-shop-types-shop', JSON.stringify(availableShopTypes)); }, [availableShopTypes]);
  useEffect(() => { localStorage.setItem('rpg-shop-types-item', JSON.stringify(availableItemTypes)); }, [availableItemTypes]);

  useEffect(() => {
    localStorage.setItem('rpg-shop-settings', JSON.stringify(appSettings));
    const root = document.documentElement;
    root.style.setProperty('--color-primary', hexToRgb(appSettings.primaryColor));
    root.style.setProperty('--color-secondary', hexToRgb(appSettings.secondaryColor));
  }, [appSettings]);

  // Actions
  const addItem = (item: Item) => setAllItems(prev => [...prev, item]);
  const updateItem = (item: Item) => setAllItems(prev => prev.map(i => i.id === item.id ? item : i));
  const deleteItem = (id: string) => setAllItems(prev => prev.filter(i => i.id !== id));
  
  const importItems = (newItems: Item[]) => {
    setAllItems(prev => {
        const itemMap = new Map(prev.map(i => [i.id, i]));
        newItems.forEach(i => itemMap.set(i.id, i));
        return Array.from(itemMap.values());
    });
  };

  const addCity = (city: City) => setCities(prev => [...prev, city]);
  const deleteCity = (id: string) => setCities(prev => prev.filter(c => c.id !== id));

  const addNPC = (npc: NPC) => setNpcs(prev => [...prev, npc]);
  const updateNPC = (npc: NPC) => setNpcs(prev => prev.map(n => n.id === npc.id ? npc : n));
  const deleteNPC = (id: string) => setNpcs(prev => prev.filter(n => n.id !== id));

  const addShopType = (type: string) => setAvailableShopTypes(prev => [...prev, type]);
  const deleteShopType = (type: string) => setAvailableShopTypes(prev => prev.filter(t => t !== type));
  
  const addItemType = (type: string) => setAvailableItemTypes(prev => [...prev, type]);
  const deleteItemType = (type: string) => setAvailableItemTypes(prev => prev.filter(t => t !== type));

  const generateShop = (
      types: ShopType[], 
      systems: SystemTag[], 
      minItems: number, 
      maxItems: number, 
      specificNPCId?: string,
      location?: string
  ) => {
    // 1. Filter Items based on Systems AND Types
    const pool = allItems.filter(i => systems.includes(i.system));
    
    // Logic: Item is relevant if it matches ANY of the selected types rules
    // For standard types, we have hardcoded rules, for custom types, we might just include all or define rules later
    // For now, let's keep the hardcoded logic for basic types and allow "General" to be inclusive
    const relevantPool = pool.filter(i => {
      // If "General" is selected, include everything
      if (types.includes('General')) return true;

      // Check specific mappings
      return types.some(type => {
          if (type === 'Blacksmith') return i.type === 'Weapon' || i.type === 'Armor';
          if (type === 'Alchemist') return i.type === 'Potion';
          if (type === 'Magic') return i.type === 'MagicItem' || i.type === 'Potion';
          if (type === 'Tavern') return i.type === 'Service' || i.type === 'Gear';
          // For custom shop types, we strictly match item type if names match, or just include it if it's general
          // This is a simplification. Realistically custom types need configuration. 
          // Current fallback: If it's a custom type, include items that have the same type name
          return i.type === type; 
      });
    });

    const effectiveMin = Math.max(0, minItems);
    const effectiveMax = Math.max(effectiveMin, maxItems);
    const itemCount = Math.floor(Math.random() * (effectiveMax - effectiveMin + 1)) + effectiveMin;
    
    const selectedItems: Item[] = [];
    const safePool = relevantPool.length > 0 ? relevantPool : pool; 
    
    if (safePool.length > 0 && itemCount > 0) {
      for (let i = 0; i < itemCount; i++) {
        const randomItem = safePool[Math.floor(Math.random() * safePool.length)];
        selectedItems.push({ ...randomItem, id: crypto.randomUUID() });
      }
    }

    // NPC Selection
    let selectedNPC: NPC;
    if (specificNPCId && specificNPCId !== 'random') {
       const found = npcs.find(n => n.id === specificNPCId);
       selectedNPC = found ? { ...found } : { name: "Unknown", race: "Unknown", personality: "Unknown", description: "", avatarUrl: "" };
    } else {
        selectedNPC = {
          name: NPC_NAMES[Math.floor(Math.random() * NPC_NAMES.length)],
          race: NPC_RACES[Math.floor(Math.random() * NPC_RACES.length)],
          personality: NPC_TRAITS[Math.floor(Math.random() * NPC_TRAITS.length)],
          description: "A seasoned veteran of the trade.",
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/200`
        };
    }

    // Location Selection
    let finalLocation = location;
    if (!finalLocation || finalLocation === 'random') {
        finalLocation = cities.length > 0 
            ? cities[Math.floor(Math.random() * cities.length)].name 
            : 'Unknown';
    }

    // Initialize Category Modifiers (default 1.0 for all)
    const categoryModifiers: Record<string, number> = {};
    availableItemTypes.forEach(t => categoryModifiers[t] = 1.0);

    const newShop: Shop = {
      id: crypto.randomUUID(),
      name: `${selectedNPC.name}'s ${types.length > 1 ? 'Emporium' : types[0]}`,
      type: types.join(' & ') as any,
      npc: selectedNPC,
      location: finalLocation,
      inventory: selectedItems,
      systemFilter: systems,
      settings: {
        priceModifier: 1.0,
        categoryModifiers,
        allowBarter: Math.random() > 0.5,
        flavorText: FLAVOR_TEXTS[Math.floor(Math.random() * FLAVOR_TEXTS.length)]
      }
    };

    setCurrentShop(newShop);
  };

  const saveShop = (shop: Shop) => {
    setSavedShops(prev => {
      const exists = prev.find(s => s.id === shop.id);
      if (exists) return prev.map(s => s.id === shop.id ? shop : s);
      return [...prev, shop];
    });
  };

  const deleteShop = (id: string) => {
    setSavedShops(prev => prev.filter(s => s.id !== id));
    if (currentShop?.id === id) setCurrentShop(null);
  };

  const updateSettings = (settings: Partial<AppSettings>) => setAppSettings(prev => ({ ...prev, ...settings }));
  
  const updateCurrentShop = (updates: Partial<Shop>) => {
    if (!currentShop) return;
    setCurrentShop({ ...currentShop, ...updates });
  };

  const loadShop = (id: string) => {
    const shop = savedShops.find(s => s.id === id);
    if (shop) setCurrentShop(shop);
  };

  const setLanguage = (lang: 'en' | 'pt' | 'es') => updateSettings({ language: lang });

  return (
    <StoreContext.Provider value={{
      allItems, savedShops, appSettings, currentShop, cities, npcs, availableShopTypes, availableItemTypes,
      addItem, updateItem, deleteItem, importItems,
      addCity, deleteCity,
      addNPC, updateNPC, deleteNPC,
      addShopType, deleteShopType, addItemType, deleteItemType,
      generateShop, saveShop, deleteShop, updateSettings,
      updateCurrentShop, loadShop, setLanguage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) throw new Error('useStore must be used within a StoreProvider');
  return context;
};