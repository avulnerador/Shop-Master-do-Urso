import React, { useState, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { BookOpen, Plus, Trash2, Tag, ShoppingBag, Globe, Star, Download, FileUp } from 'lucide-react';

const RulesManager: React.FC = () => {
  const { 
      availableShopTypes, addShopType, deleteShopType, 
      availableItemTypes, addItemType, deleteItemType,
      availableSystems, addSystem, deleteSystem,
      availableRarities, addRarity, deleteRarity,
      importRules, appSettings 
  } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newShopType, setNewShopType] = useState('');
  const [newItemType, setNewItemType] = useState('');
  const [newSystem, setNewSystem] = useState('');
  const [newRarity, setNewRarity] = useState('');

  const handleAddShopType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShopType.trim() && !availableShopTypes.includes(newShopType)) {
        addShopType(newShopType.trim());
        setNewShopType('');
    }
  };

  const handleAddItemType = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItemType.trim() && !availableItemTypes.includes(newItemType)) {
        addItemType(newItemType.trim());
        setNewItemType('');
    }
  };

  const handleAddSystem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSystem.trim() && !availableSystems.includes(newSystem)) {
        addSystem(newSystem.trim());
        setNewSystem('');
    }
  };

  const handleAddRarity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRarity.trim() && !availableRarities.includes(newRarity)) {
        addRarity(newRarity.trim());
        setNewRarity('');
    }
  };

  const handleExport = () => {
    const allRules = {
        shopTypes: availableShopTypes,
        itemTypes: availableItemTypes,
        systems: availableSystems,
        rarities: availableRarities
    };
    const dataStr = JSON.stringify(allRules, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rpg_rules_config.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const parsed = JSON.parse(event.target?.result as string);
              importRules(parsed);
              alert(t.importSuccess);
          } catch (err) {
              alert(t.importError);
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  return (
    <div className="h-full max-w-6xl mx-auto space-y-6 overflow-y-auto pb-10">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="text-secondary" /> {t.rulesManager}
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={handleExport}
                    className="px-3 py-2 bg-surface border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 flex items-center gap-2 text-sm transition-colors"
                    title="Export All Rules"
                >
                    <Download size={14} /> {t.exportData}
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center gap-2 text-sm transition-colors"
                    title="Import Rules Config"
                >
                    <FileUp size={14} /> {t.importData}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    className="hidden" 
                    accept=".json"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop Types */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-primary"/> {t.shopTypes}
                </h3>
                <form onSubmit={handleAddShopType} className="flex gap-2 mb-4">
                    <input 
                        value={newShopType}
                        onChange={e => setNewShopType(e.target.value)}
                        placeholder={t.typePlaceholder}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                    />
                    <button type="submit" className="px-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors">
                        <Plus size={18} />
                    </button>
                </form>
                <div className="flex flex-wrap gap-2">
                    {availableShopTypes.map(type => (
                        <div key={type} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 hover:border-primary/50 transition">
                            <span className="text-sm text-gray-300">{type}</span>
                            <button onClick={() => deleteShopType(type)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Item Types */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-secondary"/> {t.itemTypes}
                </h3>
                <form onSubmit={handleAddItemType} className="flex gap-2 mb-4">
                    <input 
                        value={newItemType}
                        onChange={e => setNewItemType(e.target.value)}
                        placeholder={t.typePlaceholder}
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-secondary"
                    />
                    <button type="submit" className="px-3 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Plus size={18} />
                    </button>
                </form>
                <div className="flex flex-wrap gap-2">
                    {availableItemTypes.map(type => (
                        <div key={type} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 hover:border-secondary/50 transition">
                            <span className="text-sm text-gray-300">{type}</span>
                            <button onClick={() => deleteItemType(type)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Systems */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Globe size={18} className="text-primary"/> {t.systems}
                </h3>
                <form onSubmit={handleAddSystem} className="flex gap-2 mb-4">
                    <input 
                        value={newSystem}
                        onChange={e => setNewSystem(e.target.value)}
                        placeholder="e.g. Pathfinder 2e"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary"
                    />
                    <button type="submit" className="px-3 bg-primary/20 text-primary border border-primary/50 rounded-lg hover:bg-primary/30 transition-colors">
                        <Plus size={18} />
                    </button>
                </form>
                <div className="flex flex-wrap gap-2">
                    {availableSystems.map(sys => (
                        <div key={sys} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 hover:border-primary/50 transition">
                            <span className="text-sm text-gray-300">{sys}</span>
                            <button onClick={() => deleteSystem(sys)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rarities */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg">
                 <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Star size={18} className="text-secondary"/> {t.rarities}
                </h3>
                <form onSubmit={handleAddRarity} className="flex gap-2 mb-4">
                    <input 
                        value={newRarity}
                        onChange={e => setNewRarity(e.target.value)}
                        placeholder="e.g. Mythic"
                        className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-secondary"
                    />
                    <button type="submit" className="px-3 bg-secondary/20 text-secondary border border-secondary/50 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Plus size={18} />
                    </button>
                </form>
                <div className="flex flex-wrap gap-2">
                    {availableRarities.map(rarity => (
                        <div key={rarity} className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full border border-white/5 hover:border-secondary/50 transition">
                            <span className="text-sm text-gray-300">{rarity}</span>
                            <button onClick={() => deleteRarity(rarity)} className="text-gray-500 hover:text-red-400">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default RulesManager;