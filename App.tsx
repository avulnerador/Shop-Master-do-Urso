import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './contexts/StoreContext';
import ShopGenerator from './components/ShopGenerator';
import SettingsPanel from './components/Settings';
import InventoryManager from './components/InventoryManager';
import WorldManager from './components/WorldManager';
import NPCManager from './components/NPCManager';
import RulesManager from './components/RulesManager'; // New
import { TRANSLATIONS } from './constants';
import { Store, Settings, Archive, Menu, X, Package, Map, Users, ChevronDown, ChevronRight, MapPin, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout: React.FC = () => {
  const { appSettings, savedShops, loadShop } = useStore();
  const t = TRANSLATIONS[appSettings.language];
  const [activeTab, setActiveTab] = useState<'generator' | 'inventory' | 'world' | 'npcs' | 'settings' | 'rules'>('generator');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Grouping state
  const [expandedLocations, setExpandedLocations] = useState<Record<string, boolean>>({});

  const shopsByLocation = useMemo(() => {
    const groups: Record<string, typeof savedShops> = {};
    savedShops.forEach(shop => {
        const loc = shop.location || t.unknownLocation;
        if (!groups[loc]) groups[loc] = [];
        groups[loc].push(shop);
    });
    return groups;
  }, [savedShops, t.unknownLocation]);

  const toggleLocation = (loc: string) => {
      setExpandedLocations(prev => ({ ...prev, [loc]: !prev[loc] }));
  };

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
        onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === id 
        ? 'bg-primary/10 text-primary border border-primary/20' 
        : 'hover:bg-white/5 text-gray-400'
        }`}
    >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-dark overflow-hidden font-sans text-gray-200">
      
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden absolute top-4 left-4 z-50 p-2 bg-surface rounded-md border border-white/10"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-40 w-64 h-full bg-surface border-r border-white/5 flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary flex-shrink-0">
               <Store size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary leading-tight">
              Shop Master do Urso
            </h1>
          </div>
          <p className="text-xs text-gray-500 pl-1">Gerador de lojas aleatório e personalizado</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden flex flex-col">
          <div className="flex-shrink-0 space-y-2">
            <NavItem id="generator" icon={Store} label={t.shopGenerator} />
            <NavItem id="inventory" icon={Package} label={t.inventory} />
            <NavItem id="world" icon={Map} label={t.worldManager} />
            <NavItem id="npcs" icon={Users} label={t.npcManager} />
            <NavItem id="rules" icon={BookOpen} label={t.rulesManager} />
            <NavItem id="settings" icon={Settings} label={t.settings} />
          </div>

          {/* Saved Shops List */}
          <div className="mt-8 border-t border-white/5 pt-4 flex-1 overflow-hidden flex flex-col">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-4 mb-2 flex items-center gap-2">
              <Archive size={12} /> {t.savedShops}
            </h3>
            
            <div className="overflow-y-auto pr-2 scrollbar-thin flex-1 pb-4">
              {savedShops.length === 0 && (
                <p className="px-4 text-xs text-gray-600 italic">{t.noShops}</p>
              )}
              
              {/* Grouped Lists */}
              {Object.entries(shopsByLocation).map(([location, shops]) => (
                  <div key={location} className="mb-2">
                      <button 
                        onClick={() => toggleLocation(location)}
                        className="w-full flex items-center justify-between px-4 py-1.5 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded transition"
                      >
                          <div className="flex items-center gap-2">
                             <MapPin size={12} className="text-secondary"/>
                             {location}
                          </div>
                          {expandedLocations[location] ? <ChevronDown size={12}/> : <ChevronRight size={12}/>}
                      </button>
                      
                      <AnimatePresence>
                          {(expandedLocations[location]) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                  {shops.map(shop => (
                                    <button
                                      key={shop.id}
                                      onClick={() => {
                                        loadShop(shop.id);
                                        setActiveTab('generator');
                                        setSidebarOpen(false);
                                      }}
                                      className="w-full text-left pl-8 pr-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-md truncate transition-colors border-l border-white/5 ml-4 hover:border-primary"
                                    >
                                      {shop.name}
                                    </button>
                                  ))}
                              </motion.div>
                          )}
                      </AnimatePresence>
                  </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 text-xs text-gray-600 text-center flex-shrink-0">
          v1.5.0
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-hidden relative bg-dark flex flex-col">
        {/* Background Ambient Effect */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        
        <div className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto pt-16 lg:pt-10 w-full overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'generator' && (
              <motion.div 
                key="gen"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <ShopGenerator />
              </motion.div>
            )}
            {activeTab === 'inventory' && (
              <motion.div 
                key="inv"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <InventoryManager />
              </motion.div>
            )}
            {activeTab === 'world' && (
              <motion.div 
                key="world"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <WorldManager />
              </motion.div>
            )}
            {activeTab === 'npcs' && (
              <motion.div 
                key="npcs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <NPCManager />
              </motion.div>
            )}
             {activeTab === 'rules' && (
              <motion.div 
                key="rules"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <RulesManager />
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div 
                key="set"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <MainLayout />
    </StoreProvider>
  );
};

export default App;