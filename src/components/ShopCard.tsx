import React, { useRef } from 'react';
import { Shop } from '../../types';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../../constants';
import { Download, Coins, MapPin, User, Tag } from 'lucide-react';
import html2canvas from 'html2canvas';

interface ShopCardProps {
  shop: Shop;
  onImageClick?: () => void;
}

const ShopCard: React.FC<ShopCardProps> = ({ shop, onImageClick }) => {
  const { appSettings } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExportPng = async () => {
    if (cardRef.current) {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e293b', // Match surface color
        useCORS: true, // For images
        scale: 2 // High res
      });
      const link = document.createElement('a');
      link.download = `${shop.name.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL();
      link.click();
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

  return (
    <div className="flex flex-col gap-4">
      {/* Action Bar */}
      <div className="flex justify-end gap-2">
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
        className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-surface p-0"
        style={{
            background: 'linear-gradient(145deg, rgba(30,41,59,1) 0%, rgba(15,23,42,1) 100%)'
        }}
      >
        {/* Dynamic Theme Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />
        
        {/* Header */}
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-start">
            <div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {shop.name}
                </h2>
                <div className="flex items-center gap-2 text-gray-400 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs uppercase font-bold tracking-wider">
                        {shop.type}
                    </span>
                    {shop.location && (
                        <span className="flex items-center gap-1 text-xs">
                            <MapPin size={12} /> {shop.location}
                        </span>
                    )}
                </div>
            </div>
            {/* NPC Mini Card */}
            <div className="flex items-center gap-3 bg-black/20 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                <div className="text-right">
                    <p className="text-sm font-bold text-white">{shop.npc.name}</p>
                    <p className="text-xs text-gray-400">{shop.npc.race} • {shop.npc.personality}</p>
                </div>
                <div 
                  onClick={onImageClick}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold overflow-hidden ${onImageClick ? 'cursor-pointer hover:ring-2 ring-white/50' : ''}`}
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

          <p className="mt-4 text-gray-400 italic text-sm border-l-2 border-secondary pl-3">
            "{shop.settings.flavorText}"
          </p>

          <div className="mt-4 flex gap-4 text-xs text-gray-300">
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
        <div className="bg-black/20 p-6 border-t border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">{t.items}</h3>
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
                                    <p className="font-medium text-gray-200">{item.name}</p>
                                    <div className="flex gap-2 text-xs text-gray-500">
                                        <span>{item.type}</span>
                                        <span>•</span>
                                        <span>{item.weight || '-'}</span>
                                        <span>•</span>
                                        <span className="text-secondary opacity-70">{item.system}</span>
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