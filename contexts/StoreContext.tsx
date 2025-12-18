import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Item, Shop, AppSettings, ShopType, SystemTag, ShopSettings, NPC, City } from '../types';
import { INITIAL_ITEMS, INITIAL_NPCS, INITIAL_SHOP_TYPES, INITIAL_ITEM_TYPES, INITIAL_SYSTEMS, INITIAL_RARITIES, NPC_NAMES, NPC_RACES, NPC_TRAITS, FLAVOR_TEXTS } from '../constants';

interface StoreContextType {
  allItems: Item[];
  savedShops: Shop[];
  cities: City[];
  npcs: NPC[]; // Global NPCs
  availableShopTypes: string[];
  availableItemTypes: string[];
  availableSystems: string[];
  availableRarities: string[];
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
  importCities: (cities: City[]) => void;

  // NPC CRUD
  addNPC: (npc: NPC) => void;
  updateNPC: (npc: NPC) => void;
  deleteNPC: (id: string) => void;
  importNPCs: (npcs: NPC[]) => void;

  // Type Management
  addShopType: (type: string) => void;
  deleteShopType: (type: string) => void;
  addItemType: (type: string) => void;
  deleteItemType: (type: string) => void;
  addSystem: (sys: string) => void;
  deleteSystem: (sys: string) => void;
  addRarity: (rarity: string) => void;
  deleteRarity: (rarity: string) => void;
  importRules: (data: { shopTypes?: string[], itemTypes?: string[], systems?: string[], rarities?: string[] }) => void;

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

  const [availableSystems, setAvailableSystems] = useState<string[]>(() => {
      const saved = localStorage.getItem('rpg-shop-types-system');
      return saved ? JSON.parse(saved) : INITIAL_SYSTEMS;
  });

  const [availableRarities, setAvailableRarities] = useState<string[]>(() => {
      const saved = localStorage.getItem('rpg-shop-types-rarity');
      return saved ? JSON.parse(saved) : INITIAL_RARITIES;
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
  useEffect(() => { localStorage.setItem('rpg-shop-types-system', JSON.stringify(availableSystems)); }, [availableSystems]);
  useEffect(() => { localStorage.setItem('rpg-shop-types-rarity', JSON.stringify(availableRarities)); }, [availableRarities]);

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
  const importCities = (newCities: City[]) => {
      setCities(prev => {
          const cityMap = new Map(prev.map(c => [c.id, c]));
          newCities.forEach(c => cityMap.set(c.id || crypto.randomUUID(), { ...c, id: c.id || crypto.randomUUID() }));
          return Array.from(cityMap.values());
      });
  };

  const addNPC = (npc: NPC) => setNpcs(prev => [...prev, npc]);
  const updateNPC = (npc: NPC) => setNpcs(prev => prev.map(n => n.id === npc.id ? npc : n));
  const deleteNPC = (id: string) => setNpcs(prev => prev.filter(n => n.id !== id));
  const importNPCs = (newNPCs: NPC[]) => {
      setNpcs(prev => {
          const npcMap = new Map(prev.map(n => [n.id, n]));
          newNPCs.forEach(n => npcMap.set(n.id || crypto.randomUUID(), { ...n, id: n.id || crypto.randomUUID() }));
          return Array.from(npcMap.values());
      });
  };

  const addShopType = (type: string) => setAvailableShopTypes(prev => [...prev, type]);
  const deleteShopType = (type: string) => setAvailableShopTypes(prev => prev.filter(t => t !== type));
  
  const addItemType = (type: string) => setAvailableItemTypes(prev => [...prev, type]);
  const deleteItemType = (type: string) => setAvailableItemTypes(prev => prev.filter(t => t !== type));

  const addSystem = (sys: string) => setAvailableSystems(prev => [...prev, sys]);
  const deleteSystem = (sys: string) => setAvailableSystems(prev => prev.filter(s => s !== sys));

  const addRarity = (rarity: string) => setAvailableRarities(prev => [...prev, rarity]);
  const deleteRarity = (rarity: string) => setAvailableRarities(prev => prev.filter(r => r !== rarity));

  const importRules = (data: { shopTypes?: string[], itemTypes?: string[], systems?: string[], rarities?: string[] }) => {
      if (data.shopTypes) setAvailableShopTypes(prev => Array.from(new Set([...prev, ...data.shopTypes!])));
      if (data.itemTypes) setAvailableItemTypes(prev => Array.from(new Set([...prev, ...data.itemTypes!])));
      if (data.systems) setAvailableSystems(prev => Array.from(new Set([...prev, ...data.systems!])));
      if (data.rarities) setAvailableRarities(prev => Array.from(new Set([...prev, ...data.rarities!])));
  };

  const generateShop = (
      types: ShopType[], 
      systems: SystemTag[], 
      minItems: number, 
      maxItems: number, 
      specificNPCId?: string,
      location?: string
  ) => {
    const pool = allItems.filter(i => systems.includes(i.system));
    
    const relevantPool = pool.filter(i => {
      if (types.includes('General')) return true;
      return types.some(type => {
          if (type === 'Blacksmith') return i.type === 'Weapon' || i.type === 'Armor';
          if (type === 'Alchemist') return i.type === 'Potion';
          if (type === 'Magic') return i.type === 'MagicItem' || i.type === 'Potion';
          if (type === 'Tavern') return i.type === 'Service' || i.type === 'Gear';
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

    let finalLocation = location;
    if (!finalLocation || finalLocation === 'random') {
        finalLocation = cities.length > 0 
            ? cities[Math.floor(Math.random() * cities.length)].name 
            : 'Unknown';
    }

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
      allItems, savedShops, appSettings, currentShop, cities, npcs, 
      availableShopTypes, availableItemTypes, availableSystems, availableRarities,
      addItem, updateItem, deleteItem, importItems,
      addCity, deleteCity, importCities,
      addNPC, updateNPC, deleteNPC, importNPCs,
      addShopType, deleteShopType, addItemType, deleteItemType, addSystem, deleteSystem, addRarity, deleteRarity, importRules,
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