import React, { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { ShopType, SystemTag, Item, ItemType } from '../types';
import ShopCard from './ShopCard';
import { Sparkles, Save, Trash2, RefreshCw, Edit, Plus, X, Search, DollarSign, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ShopGenerator: React.FC = () => {
  const { 
    appSettings, currentShop, cities, allItems, npcs, 
    generateShop, saveShop, deleteShop, updateCurrentShop,
    availableShopTypes, availableItemTypes, availableSystems, availableRarities 
  } = useStore();
  const t = TRANSLATIONS[appSettings.language];

  // Generator State
  const [selectedTypes, setSelectedTypes] = useState<ShopType[]>(['General']);
  const [selectedSystems, setSelectedSystems] = useState<SystemTag[]>(['D&D 5e', 'Tormenta 20', 'Generic']);
  const [minItems, setMinItems] = useState(3);
  const [maxItems, setMaxItems] = useState(10);
  const [selectedNPCId, setSelectedNPCId] = useState<string>('random');
  const [selectedCity, setSelectedCity] = useState<string>('random');

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  
  // Full Item Edit Modal State
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Image Modal State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleSystemToggle = (sys: SystemTag) => {
    if (selectedSystems.includes(sys)) {
      setSelectedSystems(prev => prev.filter(s => s !== sys));
    } else {
      setSelectedSystems(prev => [...prev, sys]);
    }
  };

  const handleTypeToggle = (type: ShopType) => {
      if (selectedTypes.includes(type)) {
          if (selectedTypes.length > 1) {
             setSelectedTypes(prev => prev.filter(t => t !== type));
          }
      } else {
          setSelectedTypes(prev => [...prev, type]);
      }
  };

  const handleGenerate = () => {
    // Validation Logic
    if (selectedTypes.length === 0) {
        alert("Please select at least one Shop Type.");
        return;
    }
    if (selectedSystems.length === 0) {
        alert("Please select at least one Game System filter.");
        return;
    }
    if (minItems < 1 || maxItems < 1) {
        alert("Minimum and Maximum items must be at least 1.");
        return;
    }
    if (minItems > 50 || maxItems > 50) {
        alert("Maximum limit is 50 items to ensure performance.");
        return;
    }
    if (minItems > maxItems) {
        alert("Minimum items cannot be greater than Maximum items.");
        return;
    }

    setIsEditMode(false);
    generateShop(selectedTypes, selectedSystems, minItems, maxItems, selectedNPCId, selectedCity);
  };

  const handleAddItemToShop = (item: Item) => {
    if (currentShop) {
        if (currentShop.inventory.length >= 50) {
            alert("Shop inventory is full (max 50 items).");
            return;
        }
        const newItem = { ...item, id: crypto.randomUUID() };
        updateCurrentShop({ inventory: [...currentShop.inventory, newItem] });
    }
  };

  const handleRemoveItemFromShop = (instanceId: string) => {
      if (currentShop) {
          updateCurrentShop({ inventory: currentShop.inventory.filter(i => i.id !== instanceId) });
      }
  };

  const handleUpdateItemInShop = (instanceId: string, updates: Partial<Item>) => {
      if (currentShop) {
          updateCurrentShop({
              inventory: currentShop.inventory.map(i => 
                  i.id === instanceId ? { ...i, ...updates } : i
              )
          });
      }
  };

  const handleSaveFullItemEdit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem) {
          handleUpdateItemInShop(editingItem.id, editingItem);
          setEditingItem(null);
      }
  };

  const handleCategoryModifierChange = (category: string, value: number) => {
    if (currentShop) {
        const newModifiers = { ...currentShop.settings.categoryModifiers, [category]: value };
        updateCurrentShop({ 
            settings: { ...currentShop.settings, categoryModifiers: newModifiers }
        });
    }
  };

  const handleApplyExistingNPC = (id: string) => {
     if (id === 'random') return; 
     const found = npcs.find(n => n.id === id);
     if (found && currentShop) {
         updateCurrentShop({ npc: { ...found } });
     }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full relative">
      
      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={() => setPreviewImage(null)}
            >
                <motion.div 
                    initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                    className="relative max-w-2xl w-full bg-surface p-2 rounded-xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setPreviewImage(null)} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/20">
                        <X size={24} />
                    </button>
                    <img src={previewImage} alt="NPC" className="w-full h-auto rounded-lg shadow-2xl" />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Item Full Edit Modal */}
      <AnimatePresence>
        {editingItem && (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
             >
                <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
                    <button onClick={() => setEditingItem(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Edit2 size={18} className="text-primary" /> {t.editItemFull}
                    </h3>
                    
                    <form onSubmit={handleSaveFullItemEdit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.name}</label>
                                <input 
                                    required
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.name} 
                                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.price}</label>
                                <input 
                                    type="number" required
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.price} 
                                    onChange={e => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.type}</label>
                                <select 
                                    className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.type} 
                                    onChange={e => setEditingItem({...editingItem, type: e.target.value as ItemType})}
                                >
                                    {availableItemTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.system}</label>
                                <select 
                                    className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.system} 
                                    onChange={e => setEditingItem({...editingItem, system: e.target.value as SystemTag})}
                                >
                                    {availableSystems.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.rarity}</label>
                                <select 
                                    className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full text-xs focus:outline-none focus:border-primary"
                                    value={editingItem.rarity} 
                                    onChange={e => setEditingItem({...editingItem, rarity: e.target.value as any})}
                                >
                                    {availableRarities.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.weight}</label>
                                <input 
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.weight || ''} 
                                    onChange={e => setEditingItem({...editingItem, weight: e.target.value})}
                                />
                            </div>
                             <div>
                                <label className="block text-xs text-gray-400 mb-1">{t.currency}</label>
                                <input 
                                    className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={editingItem.currency} 
                                    onChange={e => setEditingItem({...editingItem, currency: e.target.value})}
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
                        >
                            <Check size={18} /> {t.saveChanges}
                        </button>
                    </form>
                </div>
             </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT COLUMN: Controls */}
      <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-hidden">
        {/* Generator Card */}
        <div className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg flex-shrink-0">
          <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
            <Sparkles className="text-secondary" /> {t.shopGenerator}
          </h2>

          <div className="space-y-4">
            {/* Shop Types (Multi-select) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.type} <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                  {availableShopTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => handleTypeToggle(type)}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            selectedTypes.includes(type)
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                        }`}
                      >
                          {type}
                      </button>
                  ))}
              </div>
              {selectedTypes.length === 0 && <span className="text-[10px] text-red-400 mt-1 block">Select at least one type.</span>}
            </div>

            {/* Min/Max Items */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.minItems} (1-50)</label>
                     <input 
                        type="number" min="1" max="50"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white placeholder-gray-500"
                        value={minItems}
                        onChange={(e) => setMinItems(Math.min(50, Math.max(1, parseInt(e.target.value) || 0)))}
                     />
                </div>
                <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.maxItems} (1-50)</label>
                     <input 
                        type="number" min="1" max="50"
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white placeholder-gray-500"
                        value={maxItems}
                        onChange={(e) => setMaxItems(Math.min(50, Math.max(1, parseInt(e.target.value) || 0)))}
                     />
                </div>
            </div>

            {/* NPC & Location Selector */}
            <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.selectNPC}</label>
                  <select 
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary text-xs"
                    value={selectedNPCId}
                    onChange={(e) => setSelectedNPCId(e.target.value)}
                  >
                    <option value="random">{t.randomNPC}</option>
                    {npcs.map(npc => (
                        <option key={npc.id} value={npc.id}>{npc.name} ({npc.race})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.shopLocation}</label>
                  <select 
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:border-primary text-xs"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="random">{t.randomCity}</option>
                    {cities.map(city => (
                        <option key={city.id} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
            </div>

            {/* System Filter */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t.filters} <span className="text-red-400">*</span></label>
              <div className="flex flex-wrap gap-2">
                {availableSystems.map(sys => (
                  <button
                    key={sys}
                    onClick={() => handleSystemToggle(sys)}
                    className={`px-3 py-1 text-xs rounded-full border transition-all ${
                      selectedSystems.includes(sys)
                        ? 'bg-secondary/20 border-secondary text-secondary'
                        : 'bg-transparent border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {sys}
                  </button>
                ))}
              </div>
              {selectedSystems.length === 0 && <span className="text-[10px] text-red-400 mt-1 block">Select at least one system.</span>}
            </div>

            <button 
              onClick={handleGenerate}
              className="w-full py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} /> {t.generate}
            </button>
          </div>
        </div>

        {/* Edit Controls (Only visible if shop exists) */}
        {currentShop && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="bg-surface border border-white/10 rounded-xl p-6 shadow-lg space-y-4 flex-1 overflow-y-auto"
           >
             <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t.actions}</h3>
                <button 
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`p-2 rounded transition-colors ${isEditMode ? 'bg-primary text-white' : 'bg-white/5 text-gray-400'}`}
                >
                    <Edit size={16} />
                </button>
             </div>
             
             {isEditMode ? (
                 <div className="space-y-4 bg-black/20 p-3 rounded-lg border border-white/5">
                     {/* Edit Shop Details */}
                     <div>
                         <label className="text-xs text-gray-500 mb-1 block">{t.shopName}</label>
                         <input 
                            value={currentShop.name}
                            onChange={(e) => updateCurrentShop({ name: e.target.value })}
                            className="w-full bg-dark border border-white/10 rounded p-1 text-sm text-white"
                         />
                     </div>
                     <div>
                         <label className="text-xs text-gray-500 mb-1 block">{t.shopLocation}</label>
                         <select 
                            value={currentShop.location || ''}
                            onChange={(e) => updateCurrentShop({ location: e.target.value })}
                            className="w-full bg-[#1e293b] border border-white/10 rounded p-1 text-sm text-white"
                         >
                             {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                             <option value="Unknown">Unknown</option>
                         </select>
                     </div>

                     {/* Category Price Modifiers */}
                     <div className="border-t border-white/5 pt-2 mt-2">
                        <h4 className="text-xs font-bold text-primary mb-2 flex items-center gap-1">
                            <DollarSign size={12}/> {t.categoryEconomy}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {availableItemTypes.map(type => (
                                <div key={type} className="bg-dark p-2 rounded border border-white/5">
                                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                                        <span>{type}</span>
                                        <span>{Math.round((currentShop.settings.categoryModifiers?.[type] || 1) * 100)}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0.1" max="3.0" step="0.1"
                                        value={currentShop.settings.categoryModifiers?.[type] || 1}
                                        onChange={(e) => handleCategoryModifierChange(type, parseFloat(e.target.value))}
                                        className="w-full accent-secondary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            ))}
                        </div>
                     </div>
                     
                     {/* NPC Edit */}
                     <div className="border-t border-white/5 pt-2 mt-2">
                         <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-bold text-primary">{t.editNPC}</h4>
                             <select 
                                onChange={(e) => handleApplyExistingNPC(e.target.value)}
                                className="text-[10px] bg-[#1e293b] border border-white/10 rounded text-gray-300 w-32"
                                defaultValue=""
                             >
                                 <option value="" disabled>Load Saved</option>
                                 {npcs.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                             </select>
                         </div>
                         <div className="grid grid-cols-2 gap-2 mb-2">
                            <input 
                                value={currentShop.npc.name} placeholder="Name"
                                onChange={(e) => updateCurrentShop({ npc: { ...currentShop.npc, name: e.target.value } })}
                                className="bg-dark border border-white/10 rounded p-1 text-xs text-white"
                            />
                            <input 
                                value={currentShop.npc.race} placeholder="Race"
                                onChange={(e) => updateCurrentShop({ npc: { ...currentShop.npc, race: e.target.value } })}
                                className="bg-dark border border-white/10 rounded p-1 text-xs text-white"
                            />
                         </div>
                         <input 
                                value={currentShop.npc.avatarUrl} placeholder="Image URL"
                                onChange={(e) => updateCurrentShop({ npc: { ...currentShop.npc, avatarUrl: e.target.value } })}
                                className="w-full bg-dark border border-white/10 rounded p-1 text-xs text-white mb-2"
                        />
                     </div>

                     {/* Add Items */}
                     <div className="border-t border-white/5 pt-2 mt-2">
                         <h4 className="text-xs font-bold text-primary mb-2">{t.addItemToShop}</h4>
                         <div className="relative">
                            <input 
                                value={itemSearch}
                                onChange={(e) => setItemSearch(e.target.value)}
                                placeholder={t.search}
                                className="w-full bg-dark border border-white/10 rounded p-1 pl-6 text-xs text-white"
                            />
                            <Search size={12} className="absolute top-1.5 left-1.5 text-gray-500" />
                         </div>
                         <div className="max-h-32 overflow-y-auto mt-2 space-y-1">
                             {allItems
                                .filter(i => {
                                   const matchesSearch = i.name.toLowerCase().includes(itemSearch.toLowerCase());
                                   // Filter by Shop Systems!
                                   const matchesSystem = currentShop.systemFilter.includes(i.system);
                                   return matchesSearch && matchesSystem;
                                })
                                .slice(0, 10)
                                .map(item => (
                                    <button 
                                        key={item.id}
                                        onClick={() => handleAddItemToShop(item)}
                                        className="w-full text-left flex justify-between items-center px-2 py-1 hover:bg-white/5 rounded text-xs text-gray-300"
                                    >
                                        <span>{item.name} <span className='text-[10px] text-gray-600'>({item.system})</span></span>
                                        <Plus size={10} className="text-green-500"/>
                                    </button>
                                ))
                             }
                             {allItems.filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()) && currentShop.systemFilter.includes(i.system)).length === 0 && (
                                <p className="text-[10px] text-gray-500 text-center py-2">No items found for current systems.</p>
                             )}
                         </div>
                     </div>
                 </div>
             ) : (
                <>
                    {/* Standard Controls */}
                    <div>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{t.priceModifier} (Global)</span>
                        <span>{Math.round(currentShop.settings.priceModifier * 100)}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="0.5" 
                        max="2.0" 
                        step="0.1" 
                        value={currentShop.settings.priceModifier}
                        onChange={(e) => updateCurrentShop({ 
                        settings: { ...currentShop.settings, priceModifier: parseFloat(e.target.value) } 
                        })}
                        className="w-full accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    </div>

                    {/* Barter Toggle */}
                    <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">{t.allowBarter}</span>
                    <button 
                        onClick={() => updateCurrentShop({
                            settings: { ...currentShop.settings, allowBarter: !currentShop.settings.allowBarter }
                        })}
                        className={`w-10 h-5 rounded-full relative transition-colors ${currentShop.settings.allowBarter ? 'bg-green-500' : 'bg-gray-700'}`}
                    >
                        <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${currentShop.settings.allowBarter ? 'translate-x-5' : ''}`} />
                    </button>
                    </div>
                </>
             )}

             <div className="pt-4 flex gap-2">
                <button 
                  onClick={() => saveShop(currentShop)}
                  className="flex-1 py-2 bg-green-600/20 text-green-400 border border-green-600/50 rounded-lg hover:bg-green-600/30 flex items-center justify-center gap-2"
                >
                  <Save size={16} /> {t.save}
                </button>
                <button 
                  onClick={() => deleteShop(currentShop.id)}
                  className="px-3 py-2 bg-red-600/20 text-red-400 border border-red-600/50 rounded-lg hover:bg-red-600/30"
                >
                  <Trash2 size={16} />
                </button>
             </div>
           </motion.div>
        )}
      </div>

      {/* RIGHT COLUMN: Display */}
      <div className="lg:col-span-8 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentShop ? (
            <motion.div
              key={currentShop.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className={isEditMode ? "ring-2 ring-primary bg-primary/5 rounded-xl pt-14 px-2 pb-2 relative transition-all duration-300" : "p-2 transition-all duration-300"}>
                 
                 {/* Visual indicator for editing - Moved to top left and pushed content down */}
                 {isEditMode && (
                   <div className="absolute top-3 left-4 bg-primary text-white text-xs px-3 py-1.5 rounded-md shadow-lg z-20 font-bold uppercase tracking-widest flex items-center gap-2">
                       <Edit size={12} /> Editing Mode Active
                   </div>
                 )}

                 <div className="relative">
                    {/* Shop Card with click handler for image */}
                    <ShopCard 
                        shop={currentShop} 
                        onUpdateShop={updateCurrentShop}
                        onImageClick={() => currentShop.npc.avatarUrl && setPreviewImage(currentShop.npc.avatarUrl)} 
                    />
                 </div>
                 
                 {/* Item Editor List when in Edit Mode */}
                 {isEditMode && (
                     <div className="mt-4 bg-black/30 border border-primary/30 p-4 rounded-xl">
                         <h4 className="text-primary text-xs font-bold uppercase mb-2">{t.editItems} ({currentShop.inventory.length}/50)</h4>
                         <div className="space-y-2">
                             {currentShop.inventory.map(item => (
                                 <div key={item.id} className="flex items-center gap-2 bg-surface p-2 rounded border border-white/5">
                                     <input 
                                        className="flex-1 bg-black/20 border border-white/10 rounded p-1 text-sm text-white"
                                        value={item.name}
                                        onChange={(e) => handleUpdateItemInShop(item.id, { name: e.target.value })}
                                     />
                                     <div className="flex items-center gap-1">
                                        <input 
                                            type="number"
                                            className="w-20 bg-black/20 border border-white/10 rounded p-1 text-sm text-white text-right"
                                            value={item.price}
                                            onChange={(e) => handleUpdateItemInShop(item.id, { price: parseFloat(e.target.value) })}
                                        />
                                        <span className="text-xs text-yellow-500 font-mono w-6">{item.currency}</span>
                                     </div>
                                     <button 
                                        onClick={() => setEditingItem(item)}
                                        className="p-1.5 hover:bg-primary/40 rounded text-gray-500 hover:text-white transition"
                                        title={t.editItemFull}
                                     >
                                        <Edit2 size={14} />
                                     </button>
                                     <button 
                                        onClick={() => handleRemoveItemFromShop(item.id)}
                                        className="p-1.5 hover:bg-red-900/40 rounded text-gray-500 hover:text-red-400 transition"
                                     >
                                        <X size={14} />
                                     </button>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-800 rounded-xl p-12">
              <Sparkles size={48} className="mb-4 text-gray-700" />
              <p className="text-lg">Select parameters and click "Generate" to start.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ShopGenerator;