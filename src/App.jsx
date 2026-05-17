import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Search, Filter, CheckCircle2, Circle, TrendingUp, Landmark, Plus, X, ChevronDown, Trash2, ArrowUpRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INITIAL_LOCATIONS = [
  { city: "Montbell", kanji: "モンベル", category: "Retail", budget: 0, priority: 5, description: "Outdoor gear & apparel" },
  { city: "mont-bell Yokohama Shin-Yamashita", kanji: "モンベル 横浜しん山下", category: "Retail", budget: 0, priority: 4, description: "Shin-Yamashita Store" },
  { city: "Cerulean Tower Tokyu Hotel", kanji: "セルリアンタワー東急ホテル", category: "Hotel", budget: 0, priority: 5, description: "Main Base - Shibuya" },
  { city: "Hase Station", kanji: "長谷駅", category: "Transit", budget: 0, priority: 3, description: "Kamakura access" },
  { city: "OIMACHI TRACKS", kanji: "大井町トラックス", category: "Retail", budget: 0, priority: 3, description: "Shopping area" },
  { city: "Nihombashi Mitsukoshi Main Store", kanji: "日本橋三越本店", category: "Retail", budget: 0, priority: 4, description: "Luxury department store" },
  { city: "Laforet Harajuku", kanji: "ラフォーレ原宿", category: "Retail", budget: 0, priority: 4, description: "Harajuku fashion hub" },
  { city: "Pensta Ecute Ueno", kanji: "ペンスタ エキュート上野", category: "Retail", budget: 0, priority: 2, description: "Suica Penguin goods" },
  { city: "FREAK'S STORE Shinjuku", kanji: "フリークスストア", category: "Retail", budget: 0, priority: 4, description: "Lumineesutoshinjukuwimenzuten" },
  { city: "AGILITY Nippori Leather", kanji: "AGILITY日暮里革工房", category: "Retail", budget: 0, priority: 4, description: "Leather goods workshop" },
  { city: "Higashirinkan", kanji: "東林間", category: "Location", budget: 0, priority: 3, description: "3 Chome-18-3" },
  { city: "Mu (Nothingness)", kanji: "無", category: "Location", budget: 0, priority: 5, description: "Philosophy node" },
  { city: "Narita International Airport", kanji: "成田国際空港", category: "Transit", budget: 0, priority: 5, description: "Entry/Exit Node" },
  { city: "Red Roof Inn Kamata", kanji: "レッドルーフイン蒲田", category: "Hotel", budget: 0, priority: 5, description: "Kamata base" },
  { city: "Shizuoka", kanji: "静岡県", category: "Urban x Nature", budget: 40000, priority: 5, description: "Urban x Nature" },
  { city: "Nagoya", kanji: "名古屋", category: "Urban", budget: 30000, priority: 4, description: "Urban" },
  { city: "Tokyo Dome", kanji: "東京ドームシティ", category: "Entertainment", budget: 10000, priority: 2, description: "Entertainment" },
];

const PRIORITY_COLORS = {
  5: 'bg-g-primary-container text-g-primary border border-g-primary/20',
  4: 'bg-g-aluminium dark:bg-g-aluminium/10 text-g-text-variant border border-g-outline/10',
  3: 'bg-g-aluminium dark:bg-g-aluminium/10 text-g-text-variant border border-g-outline/10',
  2: 'bg-g-aluminium dark:bg-g-aluminium/10 text-g-text-variant border border-g-outline/10',
  1: 'bg-g-aluminium dark:bg-g-aluminium/10 text-g-text-variant border border-g-outline/10',
};

const triggerHaptic = (type = 'light') => {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(type === 'light' ? 10 : 20);
    }
  } catch (e) {}
};

export default function App() {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('onyx_itinerary_locations');
    const current = saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    const merged = [...current];
    INITIAL_LOCATIONS.forEach(initLoc => {
      if (!merged.find(l => l.city === initLoc.city)) merged.push(initLoc);
    });
    return merged;
  });
  
  const [search, setSearch] = useState('');
  const [visited, setVisited] = useState(() => {
    const saved = localStorage.getItem('onyx_itinerary_visited');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [time, setTime] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newLoc, setNewLoc] = useState({ city: '', kanji: '', category: 'Urban', budget: 0, priority: 5 });
  const [isStealthMode, setIsStealthMode] = useState(() => localStorage.getItem('onyx_stealth_mode') === 'true');

  // Sync stealth/dark mode across applications via localStorage listener
  useEffect(() => {
    const applyTheme = () => {
      const isDark = localStorage.getItem('onyx_stealth_mode') === 'true';
      setIsStealthMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(); // Run on mount

    const handleStorage = (e) => {
      if (e.key === 'onyx_stealth_mode') {
        applyTheme();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    let timer;
    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => setTime(new Date()), 1000);
    };
    const handleVisibility = () => document.hidden ? clearInterval(timer) : startTimer();
    document.addEventListener('visibilitychange', handleVisibility);
    startTimer();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_locations', JSON.stringify(locations));
    localStorage.setItem('onyx_itinerary_node_count', locations.length.toString()); 
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_visited', JSON.stringify(visited));
  }, [visited]);

  const tokyoTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(time);
  }, [time]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc =>
      (loc.city.toLowerCase().includes(search.toLowerCase()) || loc.kanji.includes(search))
    );
  }, [locations, search]);

  const totalBudget = useMemo(() => {
    return filteredLocations.reduce((acc, loc) => acc + (visited[loc.city] ? 0 : loc.budget), 0);
  }, [filteredLocations, visited]);

  const visitedCount = useMemo(() => {
    return Object.values(visited).filter(v => v).length;
  }, [visited]);

  const toggleVisited = useCallback((city) => {
    triggerHaptic('medium');
    setVisited(prev => ({ ...prev, [city]: !prev[city] }));
  }, []);

  const handleAddLocation = () => {
    if (!newLoc.city) return;
    triggerHaptic('medium');
    setLocations([...locations, { ...newLoc, description: newLoc.category }]);
    setNewLoc({ city: '', kanji: '', category: 'Urban', budget: 0, priority: 5 });
    setIsAdding(false);
  };

  const handleDelete = (city) => {
    triggerHaptic('heavy');
    setLocations(locations.filter(l => l.city !== city));
  };

  return (
    <div className="min-h-screen bg-g-bg text-g-text font-sans selection:bg-g-primary-container pb-28 overscroll-none transition-colors duration-700">
      <div className="max-w-md mx-auto p-6">
        
        {/* Dynamic Island Safety Spacer */}
        <div className="h-10 w-full shrink-0"></div>

        {/* High-Fidelity Outfit Header */}
        <header className="flex justify-between items-end py-6">
          <div>
            <h1 className="text-[44px] leading-[1.05] font-black font-display tracking-tight text-g-text">
              Itinerary.
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-g-primary-container text-g-primary rounded-full tracking-wide">
                {tokyoTime.split(':').slice(0, 2).join(':')} JST
              </span>
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-g-text-variant">
                Active • Node Command
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { triggerHaptic(); setIsAdding(true); }} 
              className="w-14 h-14 rounded-[20px] rounded-br-[8px] bg-g-primary text-white dark:text-[#202124] flex items-center justify-center hover:brightness-110 transition-all duration-300 shadow-elevation-2 active:scale-95 ripple"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </header>

        {/* Material 3 Expressive Core Metric Display */}
        <section className="mt-4 mb-8 relative overflow-hidden material-card p-8 border-g-primary/10 shadow-elevation-2 rounded-[32px] rounded-bl-[8px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-g-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <span className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] block mb-4">Command Summary</span>
          <div className="text-5xl font-bold tabular-nums tracking-tighter mb-2 text-g-text font-display">
            {tokyoTime}
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest">
              Destination // <span className="text-g-text">Japan</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-g-text-variant uppercase block mb-1">Progress</span>
              <span className="text-lg font-bold text-g-primary font-display">
                {visitedCount} <span className="text-xs text-g-text-variant font-medium">of</span> {locations.length}
              </span>
            </div>
          </div>
        </section>

        {/* Search */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-variant" size={18} />
            <input 
              type="text" 
              placeholder="Search destinations..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="bg-g-surface border border-g-outline/15 shadow-sm w-full p-4 pl-12 rounded-2xl text-sm font-medium focus:outline-none focus:border-g-primary transition-colors text-g-text placeholder:text-g-text-variant/60" 
            />
          </div>
        </div>

        {/* Total Cost Display Card */}
        <div className="material-card p-6 mb-8 shadow-sm flex justify-between items-center border-g-outline/10 rounded-[32px] rounded-br-[8px]">
          <div>
            <span className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest block mb-1">Pending Budget</span>
            <div className="text-2xl font-bold tabular-nums text-g-primary font-display">
              ¥{totalBudget.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-g-primary-container/40 flex items-center justify-center text-g-primary">
            <Landmark size={22} />
          </div>
        </div>

        {/* Timelines list */}
        <div className="space-y-6 relative">
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-[2px] bg-g-outline/15" />
          {filteredLocations.map((loc, idx) => (
            <motion.div 
              key={loc.city} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: idx * 0.02, type: "spring", damping: 20, stiffness: 200 }} 
              className="relative pl-12"
            >
              <div className="absolute left-[-1.125rem] top-4 z-10">
                <div className={`w-3.5 h-3.5 rounded-full border-2 border-g-bg transition-all duration-300 ${visited[loc.city] ? 'bg-g-primary scale-110 shadow-sm' : 'bg-g-outline scale-100'}`} />
              </div>
              <div className={cn(
                "material-card p-5 transition-all shadow-sm ripple group",
                visited[loc.city] ? 'opacity-55 border-dashed bg-g-bg/50' : 'hover:border-g-primary/30',
                idx % 2 === 0 ? "rounded-[32px] rounded-br-[8px]" : "rounded-[32px] rounded-bl-[8px]"
              )}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-black tracking-tight leading-none mb-1.5 font-display text-g-text">{loc.city}</h3>
                    <p className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider">{loc.kanji}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.city + (loc.kanji ? ' ' + loc.kanji : ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => triggerHaptic('medium')}
                      className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary hover:bg-g-primary-container transition-all cursor-pointer"
                      title="View in Google Maps"
                    >
                      <ArrowUpRight size={18} />
                    </a>
                    <button 
                      onClick={() => toggleVisited(loc.city)} 
                      className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary transition-colors cursor-pointer"
                    >
                      {visited[loc.city] ? <CheckCircle2 size={20} className="text-g-primary" /> : <Circle size={20} className="text-g-outline group-hover:text-g-primary/50" />}
                    </button>
                    <button 
                      onClick={() => handleDelete(loc.city)} 
                      className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text-variant hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-4 pt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-g-aluminium/50 dark:bg-g-aluminium/10 rounded-lg text-[10px] font-bold uppercase text-g-text-variant">
                    <Landmark size={11} /> {loc.category}
                  </div>
                  <div className="text-[11px] font-bold text-g-text tabular-nums font-mono">
                    ¥{loc.budget.toLocaleString()}
                  </div>
                  <div className={`ml-auto text-[10px] font-bold px-3 py-1 rounded-full flex items-center justify-center transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-g-aluminium text-g-text-variant'}`}>
                    PRIO {loc.priority}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* bottom safety sheet */}
        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              {/* Dimmed backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => { triggerHaptic(); setIsAdding(false); }} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              />
              
              {/* Premium Frosted Glass Bottom Sheet with Exact 70% Opacity */}
              <motion.div 
                initial={{ opacity: 0, y: '100%' }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: '100%' }} 
                transition={{ type: "spring", damping: 25, stiffness: 220 }} 
                className="relative w-full max-w-lg bg-white/70 dark:bg-g-surface/70 backdrop-blur-xl border border-g-outline/15 rounded-t-[40px] rounded-b-[24px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
              >
                {/* Header status bar */}
                <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-g-primary animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">New Destination</span>
                  </div>
                  <button 
                    onClick={() => { triggerHaptic('light'); setIsAdding(false); }} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Destination Name</label>
                    <input 
                      type="text" 
                      value={newLoc.city} 
                      onChange={e => setNewLoc({ ...newLoc, city: e.target.value })} 
                      className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Kanji / Japanese</label>
                    <input 
                      type="text" 
                      value={newLoc.kanji} 
                      onChange={e => setNewLoc({ ...newLoc, kanji: e.target.value })} 
                      className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Budget (¥)</label>
                    <input 
                      type="number" 
                      value={newLoc.budget} 
                      onChange={e => setNewLoc({ ...newLoc, budget: parseInt(e.target.value) || 0 })} 
                      className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-mono font-bold focus:outline-none focus:border-g-primary transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Category</label>
                    <div className="relative">
                      <select 
                        value={newLoc.category} 
                        onChange={e => setNewLoc({ ...newLoc, category: e.target.value })} 
                        className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors appearance-none"
                      >
                        <option>Urban</option>
                        <option>Nature</option>
                        <option>Historical</option>
                        <option>Entertainment</option>
                        <option>Retail</option>
                        <option>Hotel</option>
                        <option>Transit</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-g-text-variant">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Priority (1 - 5)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={newLoc.priority} 
                      onChange={e => setNewLoc({ ...newLoc, priority: Math.max(1, Math.min(5, parseInt(e.target.value) || 5)) })} 
                      className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleAddLocation} 
                    className="w-full h-16 bg-g-primary text-white dark:text-[#202124] font-display font-black text-sm tracking-widest uppercase rounded-2xl shadow-elevation-2 hover:brightness-110 active:scale-95 transition-all duration-200 ripple flex items-center justify-center"
                  >
                    Commit Node
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
