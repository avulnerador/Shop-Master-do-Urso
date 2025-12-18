import React, { useState, useRef } from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../constants';
import { Map, Plus, Trash2, Download, FileUp } from 'lucide-react';

const WorldManager: React.FC = () => {
  const { cities, addCity, deleteCity, importCities, appSettings } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newCityName, setNewCityName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCityName.trim()) {
        addCity({ id: crypto.randomUUID(), name: newCityName });
        setNewCityName('');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(cities, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rpg_cities_backup.json`;
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
                  importCities(parsed);
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

  return (
    <div className="h-full max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="text-primary" /> {t.worldManager}
            </h2>
            <div className="flex gap-2">
                <button 
                    onClick={handleExport}
                    className="px-3 py-2 bg-surface border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 flex items-center gap-2 text-sm transition-colors"
                >
                    <Download size={14} /> {t.exportData}
                </button>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 flex items-center gap-2 text-sm transition-colors"
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

        <div className="bg-surface border border-white/10 rounded-xl p-6 mb-6 shadow-lg">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">{t.newCity}</h3>
            <form onSubmit={handleAdd} className="flex gap-2">
                <input 
                    value={newCityName}
                    onChange={e => setNewCityName(e.target.value)}
                    placeholder={t.enterCityName}
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-primary placeholder-gray-600"
                />
                <button type="submit" className="px-6 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition flex items-center justify-center">
                    <Plus />
                </button>
            </form>
        </div>

        <div className="space-y-2">
            {cities.map(city => (
                <div key={city.id} className="flex items-center justify-between p-4 bg-surface border border-white/5 rounded-xl hover:border-white/20 transition group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Map size={20} />
                        </div>
                        <span className="font-bold text-lg text-gray-200">{city.name}</span>
                    </div>
                    <button 
                        onClick={() => deleteCity(city.id)}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition"
                        title={t.delete}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            {cities.length === 0 && (
                <div className="text-center text-gray-500 py-10 italic">No cities found. Create one above!</div>
            )}
        </div>
    </div>
  );
};

export default WorldManager;