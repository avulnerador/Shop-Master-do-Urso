import React, { useState, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { Item, SystemTag, ItemType } from '../types';
import { Plus, Trash2, Edit2, Upload, Search, X, Download, FileUp } from 'lucide-react';

const InventoryManager: React.FC = () => {
  const { 
    allItems, addItem, deleteItem, updateItem, importItems, 
    appSettings, availableItemTypes, availableSystems, availableRarities,
    addSystem, addRarity
  } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filterSystem, setFilterSystem] = useState<string>('All');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterRarity, setFilterRarity] = useState<string>('All');
  
  // Form State
  const initialFormState: Item = {
    id: '',
    name: '',
    price: 0,
    currency: 'gp',
    weight: '0',
    rarity: availableRarities[0] || 'Common',
    type: availableItemTypes[0] || 'Gear',
    system: availableSystems[0] || 'Generic'
  };
  const [formData, setFormData] = useState<Item>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateItem({ ...formData, id: editingId });
    } else {
      addItem({ ...formData, id: crypto.randomUUID() });
    }
    closeForm();
  };

  const handleEdit = (item: Item) => {
    setFormData(item);
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleQuickAddSystem = () => {
      const newSys = prompt(t.enterNewSystem);
      if (newSys && !availableSystems.includes(newSys)) {
          addSystem(newSys);
          setFormData(prev => ({ ...prev, system: newSys }));
      }
  };

  const handleQuickAddRarity = () => {
      const newRarity = prompt(t.enterNewRarity);
      if (newRarity && !availableRarities.includes(newRarity)) {
          addRarity(newRarity);
          setFormData(prev => ({ ...prev, rarity: newRarity }));
      }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(allItems, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rpg_items_backup.json`;
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
              if (Array.isArray(parsed)) {
                  importItems(parsed.map((i: any) => ({...i, id: i.id || crypto.randomUUID()})));
                  alert(t.importSuccess);
              } else {
                  alert(t.importError);
              }
          } catch (err) {
              alert(t.importError);
          }
      };
      reader.readAsText(file);
      // Reset input
      e.target.value = '';
  };

  const filteredItems = allItems.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.system.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSystem = filterSystem === 'All' || i.system === filterSystem;
    const matchesType = filterType === 'All' || i.type === filterType;
    const matchesRarity = filterRarity === 'All' || i.rarity === filterRarity;

    return matchesSearch && matchesSystem && matchesType && matchesRarity;
  });

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {t.inventory} <span className="text-xs font-normal text-gray-500">({allItems.length})</span>
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={handleExport}
                className="px-3 py-2 bg-surface border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 flex items-center gap-2 text-sm transition-colors"
                title="Export JSON"
            >
                <Download size={14} /> {t.exportData}
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center gap-2 text-sm transition-colors"
                title="Import JSON"
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
            <button 
                onClick={() => setIsFormOpen(true)}
                className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 flex items-center gap-2 text-sm transition-colors border border-primary/30"
            >
                <Plus size={14} /> {t.newItem}
            </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-surface p-3 rounded-lg border border-white/5 space-y-3 shadow-lg">
          {/* Search */}
          <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg border border-white/5">
            <Search size={16} className="text-gray-500" />
            <input 
                className="bg-transparent border-none focus:outline-none text-white w-full placeholder-gray-600 text-sm"
                placeholder={t.search}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
             <div className="flex-1 min-w-[120px]">
                 <select 
                    className="w-full bg-[#1e293b] border border-white/10 rounded p-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary"
                    value={filterSystem} onChange={e => setFilterSystem(e.target.value)}
                 >
                     <option value="All">{t.all} Systems</option>
                     {availableSystems.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
             </div>
             <div className="flex-1 min-w-[120px]">
                 <select 
                    className="w-full bg-[#1e293b] border border-white/10 rounded p-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary"
                    value={filterType} onChange={e => setFilterType(e.target.value)}
                 >
                     <option value="All">{t.all} Types</option>
                     {availableItemTypes.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
             </div>
             <div className="flex-1 min-w-[120px]">
                 <select 
                    className="w-full bg-[#1e293b] border border-white/10 rounded p-1.5 text-xs text-gray-300 focus:outline-none focus:border-primary"
                    value={filterRarity} onChange={e => setFilterRarity(e.target.value)}
                 >
                     <option value="All">{t.all} Rarities</option>
                     {availableRarities.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
             </div>
          </div>
      </div>

      {/* Form Modal/Panel */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
                <button onClick={closeForm} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-white mb-4">{editingId ? t.update : t.add} Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.name}</label>
                            <input 
                                required
                                className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.price}</label>
                            <input 
                                type="number" required
                                className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.type}</label>
                            <select 
                                className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as ItemType})}
                            >
                                {availableItemTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.system}</label>
                            <div className="flex gap-1">
                                <select 
                                    className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                    value={formData.system} onChange={e => setFormData({...formData, system: e.target.value as SystemTag})}
                                >
                                    {availableSystems.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <button type="button" onClick={handleQuickAddSystem} className="p-2 bg-white/10 rounded text-green-400 hover:bg-white/20" title={t.add}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.rarity}</label>
                            <div className="flex gap-1">
                                <select 
                                    className="bg-[#1e293b] border border-white/10 rounded p-2 text-white w-full text-xs focus:outline-none focus:border-primary"
                                    value={formData.rarity} onChange={e => setFormData({...formData, rarity: e.target.value as any})}
                                >
                                    {availableRarities.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <button type="button" onClick={handleQuickAddRarity} className="p-2 bg-white/10 rounded text-green-400 hover:bg-white/20" title={t.add}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                        <div>
                             <label className="block text-xs text-gray-400 mb-1">{t.weight}</label>
                            <input 
                                className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">{t.currency}</label>
                             <input 
                                className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded hover:bg-primary/80 mt-2 transition-colors">
                        {editingId ? t.update : t.add} Item
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-2">
        {filteredItems.map(item => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-surface border border-white/5 rounded-lg hover:border-primary/30 transition group">
                <div>
                    <div className="font-bold text-gray-200">{item.name}</div>
                    <div className="text-xs text-gray-500 flex gap-2">
                        <span className="text-primary">{item.type}</span> • {item.system} • {item.rarity}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-yellow-500 font-mono">{item.price}{item.currency}</span>
                    <div className="flex gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 transition-colors"><Edit2 size={14}/></button>
                        <button onClick={() => deleteItem(item.id)} className="p-1.5 hover:bg-red-900/20 rounded text-red-400 transition-colors"><Trash2 size={14}/></button>
                    </div>
                </div>
            </div>
        ))}
        {filteredItems.length === 0 && (
            <div className="text-center text-gray-500 py-10 italic">No items found matching filters.</div>
        )}
      </div>
    </div>
  );
};

export default InventoryManager;