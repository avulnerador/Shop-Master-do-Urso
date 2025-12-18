import React, { useState, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { NPC } from '../types';
import { Plus, Trash2, Edit2, Search, X, User, Download, FileUp } from 'lucide-react';

const NPCManager: React.FC = () => {
  const { npcs, addNPC, deleteNPC, updateNPC, importNPCs, appSettings } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const initialFormState: NPC = {
    id: '',
    name: '',
    race: '',
    personality: '',
    description: '',
    avatarUrl: ''
  };
  const [formData, setFormData] = useState<NPC>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateNPC({ ...formData, id: editingId });
    } else {
      addNPC({ ...formData, id: crypto.randomUUID() });
    }
    closeForm();
  };

  const handleEdit = (npc: NPC) => {
    setFormData(npc);
    setEditingId(npc.id || null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(npcs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rpg_npcs_backup.json`;
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
                  importNPCs(parsed);
                  alert(t.importSuccess);
              } else {
                  alert(t.importError);
              }
          } catch (err) {
              alert(t.importError);
          }
      };
      reader.readAsText(file);
      e.target.value = '';
  };

  const filteredNpcs = npcs.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.race.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {t.npcManager} <span className="text-xs font-normal text-gray-500">({npcs.length})</span>
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
                <Plus size={14} /> {t.newNPC}
            </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-surface border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl relative">
                <button onClick={closeForm} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-white mb-4">{editingId ? t.update : t.add} NPC</h3>
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
                             <label className="block text-xs text-gray-400 mb-1">{t.race}</label>
                            <input 
                                required
                                className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                                value={formData.race} onChange={e => setFormData({...formData, race: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">{t.personality}</label>
                        <input 
                            required
                            className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                            value={formData.personality} onChange={e => setFormData({...formData, personality: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">{t.description}</label>
                        <textarea 
                            className="bg-black/20 border border-white/10 rounded p-2 text-white w-full h-24 focus:outline-none focus:border-primary"
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    <div>
                         <label className="block text-xs text-gray-400 mb-1">{t.avatarUrl}</label>
                        <input 
                            placeholder="https://..."
                            className="bg-black/20 border border-white/10 rounded p-2 text-white w-full focus:outline-none focus:border-primary"
                            value={formData.avatarUrl} onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-primary text-white font-bold rounded hover:bg-primary/80 mt-2 transition-colors">
                        {editingId ? t.update : t.add} NPC
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* List */}
      <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg mb-2 border border-white/5">
        <Search size={16} className="text-gray-500" />
        <input 
            className="bg-transparent border-none focus:outline-none text-white w-full placeholder-gray-600"
            placeholder={t.search}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-2">
        {filteredNpcs.map(npc => (
            <div key={npc.id} className="flex items-center justify-between p-3 bg-surface border border-white/5 rounded-lg hover:border-primary/30 transition group">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary transition-all">
                        {npc.avatarUrl ? (
                            <img src={npc.avatarUrl} alt={npc.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500"><User size={16}/></div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-gray-200">{npc.name}</div>
                        <div className="text-xs text-gray-500">
                            {npc.race} • {npc.personality}
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handleEdit(npc)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => npc.id && deleteNPC(npc.id)} className="p-1.5 hover:bg-red-900/20 rounded text-red-400 transition-colors"><Trash2 size={14}/></button>
                </div>
            </div>
        ))}
        {filteredNpcs.length === 0 && (
             <div className="text-center text-gray-500 py-10 italic">No NPCs found.</div>
        )}
      </div>
    </div>
  );
};

export default NPCManager;