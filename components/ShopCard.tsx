import React, { useRef, useState, useEffect } from 'react';
import { Shop, ShopAppearance } from '../types';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { Download, Coins, MapPin, User, Tag, Palette, X, RotateCcw, Store } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ShopCardProps {
  shop: Shop;
  onImageClick?: () => void;
  onUpdateShop?: (updates: Partial<Shop>) => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onImageClick, onUpdateShop }) => {
  const { appSettings } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const cardRef = useRef<HTMLDivElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Close color picker on Escape key
  useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
          if (e.key === 'Escape') setShowColorPicker(false);
      };
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleExportPng = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, {
          cacheBust: true,
          pixelRatio: 2 // High res
        });
        const link = document.createElement('a');
        link.download = `${shop.name.replace(/\s+/g, '_')}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export PNG", err);
        alert("Failed to create image. Try again.");
      }
    }
  };

  const calculatePrice = (item: any) => {
      // Base * Global Mod * Category Mod
      const catMod = shop.settings.categoryModifiers?.[item.type] || 1.0;
      return Math.ceil(item.price * shop.settings.priceModifier * catMod);
  };

  const handleExportJson = () => {
    const foundryData = {
      name: shop.name,
      type: "npc", // Approximate mapping
      system: "generic",
      flags: {
        rpgShopMaster: { ...shop }
      },
      items: shop.inventory.map(i => ({
        name: i.name,
        type: i.type.toLowerCase(),
        system: {
          price: { value: calculatePrice(i) },
          weight: i.weight,
          rarity: i.rarity
        }
      }))
    };
    
    const blob = new Blob([JSON.stringify(foundryData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${shop.name.replace(/\s+/g, '_')}.json`;
    link.click();
  };

  const handleAppearanceChange = (key: keyof ShopAppearance, value: string) => {
      if (onUpdateShop) {
          onUpdateShop({ 
              appearance: { 
                  ...shop.appearance, 
                  [key]: value 
              } 
          });
      }
  };

  const resetAppearance = () => {
      if (onUpdateShop) onUpdateShop({ appearance: undefined });
  };

  // Helper to convert hex to rgb string "r g b"
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
        `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` 
        : '99 102 241';
  };

  // Derive styles from shop appearance or app defaults
  const getCardStyle = () => {
      const primary = shop.appearance?.primary || appSettings.primaryColor;
      const secondary = shop.appearance?.secondary || appSettings.secondaryColor;
      const bg = shop.appearance?.background || '#0f172a'; // dark-900 equivalent
      const surface = shop.appearance?.surface || '#1e293b'; // surface equivalent
      const text = shop.appearance?.text || '#ffffff';

      const primaryRgb = hexToRgb(primary);
      const secondaryRgb = hexToRgb(secondary);

      return {
          '--shop-primary': primary,
          '--shop-primary-rgb': primaryRgb,
          '--shop-secondary': secondary,
          '--shop-secondary-rgb': secondaryRgb,
          '--shop-bg': bg,
          '--shop-surface': surface,
          '--shop-text': text,
          background: `linear-gradient(145deg, ${bg} 0%, ${surface} 100%)`,
          borderColor: `rgba(${primaryRgb}, 0.3)`,
          color: text
      } as React.CSSProperties;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Invisible backdrop to close menu */}
      {showColorPicker && (
          <div className="fixed inset-0 z-40" onClick={() => setShowColorPicker(false)} />
      )}

      {/* Action Bar */}
      <div className="flex justify-end gap-2 items-center relative z-50">
        {onUpdateShop && (
            <div className="relative">
                <button 
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className={`flex items-center gap-2 px-3 py-1 bg-surface border border-white/10 rounded-md hover:bg-white/5 transition text-sm text-gray-300 ${showColorPicker ? 'bg-white/10 ring-2 ring-primary' : ''}`}
                    title={t.shopColor}
                >
                    <Palette size={14} className="text-primary" /> {t.shopColor}
                </button>
                {showColorPicker && (
                    <div className="absolute top-full right-0 mt-2 p-4 bg-[#0f172a] border border-white/20 rounded-xl shadow-2xl z-50 flex flex-col gap-4 w-64">
                         <div className="flex justify-between items-center border-b border-white/10 pb-2">
                             <span className="text-xs font-bold uppercase text-gray-400">Customize Look</span>
                             <button onClick={() => setShowColorPicker(false)} className="text-gray-500 hover:text-white"><X size={14}/></button>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                 <label className="text-[10px] text-gray-500 uppercase">Primary</label>
                                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded border border-white/10">
                                     <input 
                                        type="color" 
                                        value={shop.appearance?.primary || appSettings.primaryColor}
                                        onChange={(e) => handleAppearanceChange('primary', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                                     />
                                     <span className="text-[10px] font-mono text-gray-300">{shop.appearance?.primary || 'Default'}</span>
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] text-gray-500 uppercase">Secondary</label>
                                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded border border-white/10">
                                     <input 
                                        type="color" 
                                        value={shop.appearance?.secondary || appSettings.secondaryColor}
                                        onChange={(e) => handleAppearanceChange('secondary', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                                     />
                                     <span className="text-[10px] font-mono text-gray-300">{shop.appearance?.secondary || 'Default'}</span>
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] text-gray-500 uppercase">Background</label>
                                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded border border-white/10">
                                     <input 
                                        type="color" 
                                        value={shop.appearance?.background || '#0f172a'}
                                        onChange={(e) => handleAppearanceChange('background', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                                     />
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <label className="text-[10px] text-gray-500 uppercase">Card Surface</label>
                                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded border border-white/10">
                                     <input 
                                        type="color" 
                                        value={shop.appearance?.surface || '#1e293b'}
                                        onChange={(e) => handleAppearanceChange('surface', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                                     />
                                 </div>
                             </div>
                              <div className="space-y-1 col-span-2">
                                 <label className="text-[10px] text-gray-500 uppercase">Headings Text</label>
                                 <div className="flex items-center gap-2 bg-white/5 p-1 rounded border border-white/10">
                                     <input 
                                        type="color" 
                                        value={shop.appearance?.text || '#ffffff'}
                                        onChange={(e) => handleAppearanceChange('text', e.target.value)}
                                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                                     />
                                     <span className="text-[10px] font-mono text-gray-300">Title Color</span>
                                 </div>
                             </div>
                         </div>

                         <button 
                            onClick={resetAppearance} 
                            className="w-full py-2 text-xs flex items-center justify-center gap-2 bg-red-900/20 text-red-400 rounded hover:bg-red-900/30 transition border border-red-900/30"
                         >
                            <RotateCcw size={12}/> Reset Defaults
                         </button>
                    </div>
                )}
            </div>
        )}

        <button onClick={handleExportPng} className="flex items-center gap-2 px-3 py-1 bg-surface border border-white/10 rounded-md hover:bg-white/5 transition text-sm">
          <Download size={14} /> {t.exportPng}
        </button>
        <button onClick={handleExportJson} className="flex items-center gap-2 px-3 py-1 bg-surface border border-white/10 rounded-md hover:bg-white/5 transition text-sm">
          <Tag size={14} /> {t.exportJson}
        </button>
      </div>

      {/* Printable Area */}
      <div 
        ref={cardRef} 
        className="relative overflow-hidden rounded-xl border shadow-2xl p-0 transition-colors duration-300"
        style={getCardStyle()}
      >
        {/* Dynamic Theme Accent */}
        <div 
            className="absolute top-0 left-0 w-full h-1" 
            style={{ background: 'linear-gradient(90deg, var(--shop-primary) 0%, var(--shop-secondary) 100%)' }}
        />
        
        {/* Header */}
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
                {/* Shop Icon */}
                <div 
                    className="mt-1 p-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(var(--shop-primary-rgb), 0.1)', color: 'var(--shop-primary)' }}
                >
                    <Store size={28} />
                </div>
                <div>
                    <h2 
                        className="text-3xl font-bold bg-clip-text text-transparent"
                        style={{ 
                            backgroundImage: `linear-gradient(to right, var(--shop-text), gray)`,
                            color: 'var(--shop-text)' // Fallback
                        }}
                    >
                        {shop.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        <span 
                            className="px-2 py-0.5 rounded-full text-xs uppercase font-bold tracking-wider"
                            style={{ backgroundColor: 'rgba(var(--shop-primary-rgb), 0.2)', color: 'var(--shop-primary)' }}
                        >
                            {shop.type}
                        </span>
                        {shop.location && (
                            <span className="flex items-center gap-1 text-xs">
                                <MapPin size={12} /> {shop.location}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {/* NPC Mini Card */}
            <div 
                className="flex items-center gap-3 p-2 rounded-lg backdrop-blur-sm border border-white/5"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
                <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--shop-text)' }}>{shop.npc.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{shop.npc.race} • {shop.npc.personality}</p>
                </div>
                <div 
                  onClick={onImageClick}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold overflow-hidden ${onImageClick ? 'cursor-pointer hover:ring-2 ring-white/50' : ''}`}
                  style={{ background: 'linear-gradient(to bottom right, var(--shop-primary), var(--shop-secondary))' }}
                >
                    <img 
                        src={shop.npc.avatarUrl} 
                        alt={shop.npc.name} 
                        className="w-full h-full object-cover" 
                        crossOrigin="anonymous" 
                    />
                </div>
            </div>
          </div>

          <p className="mt-4 italic text-sm border-l-2 pl-3" style={{ color: 'rgba(255,255,255,0.7)', borderColor: 'var(--shop-secondary)' }}>
            "{shop.settings.flavorText}"
          </p>

          <div className="mt-4 flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
             <div className="flex items-center gap-1">
                <Coins size={14} className="text-yellow-500" />
                Prices: {Math.round(shop.settings.priceModifier * 100)}%
             </div>
             <div className="flex items-center gap-1">
                <User size={14} className={shop.settings.allowBarter ? 'text-green-400' : 'text-red-400'} />
                {shop.settings.allowBarter ? t.allowBarter : 'No Barter'}
             </div>
          </div>
        </div>

        {/* Inventory List */}
        <div className="p-6 border-t border-white/5" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.items}</h3>
            <div className="grid grid-cols-1 gap-2">
                {shop.inventory.map((item, idx) => {
                    const finalPrice = calculatePrice(item);
                    return (
                        <div key={`${item.id}-${idx}`} className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition border border-transparent hover:border-white/5">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold
                                    ${item.rarity === 'Common' ? 'bg-gray-700 text-gray-300' : ''}
                                    ${item.rarity === 'Uncommon' ? 'bg-green-900/50 text-green-300' : ''}
                                    ${item.rarity === 'Rare' ? 'bg-blue-900/50 text-blue-300' : ''}
                                    ${item.rarity === 'Epic' ? 'bg-purple-900/50 text-purple-300' : ''}
                                    ${item.rarity === 'Legendary' ? 'bg-orange-900/50 text-orange-300' : ''}
                                `}>
                                    {item.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--shop-text)' }}>{item.name}</p>
                                    <div className="flex gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                        <span>{item.type}</span>
                                        <span>•</span>
                                        <span>{item.weight || '-'}</span>
                                        <span>•</span>
                                        <span style={{ color: 'var(--shop-secondary)', opacity: 0.8 }}>{item.system}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-yellow-500">{finalPrice} <span className="text-xs text-yellow-500/50">{item.currency}</span></p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCard;