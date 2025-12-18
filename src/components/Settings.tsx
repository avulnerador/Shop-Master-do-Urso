import React from 'react';
import { useStore } from '../contexts/StoreContext';
import { TRANSLATIONS } from '../../constants';
import { Palette, Globe } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const { appSettings, updateSettings } = useStore();
  const t = TRANSLATIONS[appSettings.language];

  return (
    <div className="p-6 bg-surface rounded-xl border border-white/10 space-y-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Palette className="text-primary" /> {t.settings}
      </h2>

      {/* Language */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 block font-medium uppercase tracking-wider flex items-center gap-2">
          <Globe size={14} /> Language / Idioma
        </label>
        <div className="flex gap-2">
          {(['en', 'pt', 'es'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => updateSettings({ language: lang })}
              className={`px-4 py-2 rounded-lg border transition-all ${
                appSettings.language === lang 
                  ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--color-primary),0.3)]' 
                  : 'bg-black/20 text-gray-400 border-white/10 hover:bg-white/5'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block font-medium uppercase tracking-wider">Primary Color</label>
          <div className="flex items-center gap-2">
             <input 
                type="color" 
                value={appSettings.primaryColor}
                onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
             />
             <span className="text-xs text-gray-500 font-mono">{appSettings.primaryColor}</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-400 block font-medium uppercase tracking-wider">Secondary Color</label>
           <div className="flex items-center gap-2">
             <input 
                type="color" 
                value={appSettings.secondaryColor}
                onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
             />
             <span className="text-xs text-gray-500 font-mono">{appSettings.secondaryColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;