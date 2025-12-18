
// We allow string now to support custom user types
export type SystemTag = string; 
export type ItemType = string; 
export type ShopType = string;
export type Rarity = string;
export type Language = 'en' | 'pt' | 'es';

export interface City {
  id: string;
  name: string;
  description?: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  currency: string;
  weight?: string;
  rarity: Rarity;
  type: ItemType;
  system: SystemTag;
  description?: string;
}

export interface NPC {
  id?: string; // Optional for generated NPCs, required for saved ones
  name: string;
  race: string;
  personality: string;
  description: string;
  avatarUrl: string;
}

export interface ShopSettings {
  priceModifier: number; // 1.0 = 100%
  categoryModifiers: Record<string, number>; // New: {'Weapon': 1.2, 'Potion': 0.8}
  allowBarter: boolean;
  flavorText: string;
}

export interface ShopAppearance {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  text?: string;
}

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  location?: string; // City Name
  npc: NPC;
  inventory: Item[];
  settings: ShopSettings;
  appearance?: ShopAppearance; // Detailed styling
  systemFilter: SystemTag[];
}

export interface AppSettings {
  language: Language;
  primaryColor: string; // Hex
  secondaryColor: string; // Hex
}
