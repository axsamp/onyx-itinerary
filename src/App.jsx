import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Search, Filter, CheckCircle2, Circle, TrendingUp, Landmark, Plus, X, ChevronDown } from 'lucide-react';

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
  4: 'bg-g-aluminium text-g-text-variant border border-g-outline/20',
  3: 'bg-g-aluminium text-g-text-variant border border-g-outline/20',
  2: 'bg-g-aluminium text-g-text-variant border border-g-outline/20',
  1: 'bg-g-aluminium text-g-text-variant border border-g-outline/20',
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

  const tokyoTime = useMemo(() => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(time), [time]);

  const filteredLocations = useMemo(() => locations.filter(loc =>
    (loc.city.toLowerCase().includes(search.toLowerCase()) || loc.kanji.includes(search))
  ), [locations, search]);

  const totalBudget = useMemo(() => filteredLocations.reduce((acc, loc) => acc + (visited[loc.city] ? 0 : loc.budget), 0), [filteredLocations, visited]);
  const visitedCount = useMemo(() => Object.values(visited).filter(v => v).length, [visited]);

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
    if (window.confirm(`Remove ${city}?`)) {
      triggerHaptic('light');
      setLocations(locations.filter(l => l.city !== city));
    }
  };

  return (
    <div className="min-h-screen bg-g-bg text-g-text font-sans selection:bg-g-primary-container pb-20 overscroll-none">
      <div className="max-w-md mx-auto p-6">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2"><div className="w-1.5 h-6 bg-g-primary rounded-full" /><h1 className="text-xl font-bold uppercase tracking-tight">Itinerary Command</h1></div>
          <div className="flex gap-2">
            <button onClick={() => { triggerHaptic(); navigator.clipboard.writeText(localStorage.getItem('onyx_itinerary_locations')); alert("EXPORTED."); }} className="p-3 bg-g-surface border border-g-outline/20 rounded-xl hover:bg-g-aluminium transition-colors shadow-elevation-1 ripple"><TrendingUp className="w-5 h-5 text-g-primary" /></button>
            <button onClick={() => { triggerHaptic(); setIsAdding(true); }} className="p-3 bg-g-primary rounded-xl hover:bg-blue-700 transition-colors shadow-elevation-2 ripple"><Plus className="w-5 h-5 text-white" /></button>
          </div>
        </header>

        <section className="mt-4 mb-10 relative overflow-hidden material-card p-8 border-g-primary/10 shadow-elevation-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-g-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <span className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] block mb-4">Tokyo // JST</span>
          <div className="text-5xl font-bold tabular-nums tracking-tighter mb-2">{tokyoTime}</div>
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest">Destination // <span className="text-g-text">Japan</span></div>
            <div className="text-right"><span className="text-[10px] font-bold text-g-text-variant uppercase block mb-1">Progress</span><span className="text-lg font-bold text-g-primary">{visitedCount}/{locations.length}</span></div>
          </div>
        </section>

        <div className="space-y-4 mb-8">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-g-text-variant" size={18} /><input type="text" placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-g-surface border border-g-outline/20 shadow-elevation-1 w-full p-4 pl-12 rounded-xl text-sm font-medium focus:outline-none focus:border-g-primary transition-colors" /></div>
        </div>

        <div className="material-card p-6 mb-10 shadow-elevation-1 flex justify-between items-center">
          <div><span className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest block mb-1">Total Cost</span><div className="text-2xl font-bold tabular-nums text-g-primary">¥{totalBudget.toLocaleString()}</div></div>
          <TrendingUp size={32} className="text-g-primary/20" />
        </div>

        <div className="space-y-6 relative">
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-[2px] bg-g-outline/20" />
          {filteredLocations.map((loc, idx) => (
            <motion.div key={loc.city} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="relative pl-12">
              <div className="absolute left-[-1.125rem] top-4 z-10"><div className={`w-3.5 h-3.5 rounded-full border-2 border-g-bg transition-colors ${visited[loc.city] ? 'bg-g-primary' : 'bg-g-outline'}`} /></div>
              <div className={`material-card p-5 transition-all shadow-elevation-1 ripple group ${visited[loc.city] ? 'opacity-50 border-dashed bg-g-bg/50' : 'hover:border-g-primary/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div onDoubleClick={() => handleDelete(loc.city)}><h3 className="text-lg font-bold tracking-tight leading-none mb-1">{loc.city}</h3><p className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider">{loc.kanji}</p></div>
                  <button onClick={() => toggleVisited(loc.city)} className="active:scale-90 transition-transform">{visited[loc.city] ? <CheckCircle2 size={24} className="text-g-primary" /> : <Circle size={24} className="text-g-outline group-hover:text-g-primary/50" />}</button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-g-bg rounded-md text-[10px] font-bold uppercase text-g-text-variant"><Landmark size={12} /> {loc.category}</div>
                  <div className="text-[11px] font-bold text-g-text tabular-nums">¥{loc.budget.toLocaleString()}</div>
                  <div className={`ml-auto text-[10px] font-bold px-3 py-1 rounded-full flex items-center justify-center transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-g-aluminium text-g-text-variant'}`}>{loc.priority}/5</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-g-surface flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] shadow-elevation-3">
              <div className="flex justify-between items-center mb-8 pt-8 px-8"><h3 className="text-2xl font-bold tracking-tight text-g-text">Add Destination</h3><button onClick={() => { triggerHaptic(); setIsAdding(false); }} className="w-10 h-10 bg-g-aluminium rounded-full flex items-center justify-center text-g-text ripple"><X size={20} /></button></div>
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10 px-8">
                <div className="space-y-2"><label className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider ml-1">City Name</label><input type="text" value={newLoc.city} onChange={e => setNewLoc({ ...newLoc, city: e.target.value })} className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Kanji</label><input type="text" value={newLoc.kanji} onChange={e => setNewLoc({ ...newLoc, kanji: e.target.value })} className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Budget</label><input type="number" value={newLoc.budget} onChange={e => setNewLoc({ ...newLoc, budget: parseInt(e.target.value) || 0 })} className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" /></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Category</label><div className="relative"><select value={newLoc.category} onChange={e => setNewLoc({ ...newLoc, category: e.target.value })} className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors appearance-none"><option>Urban</option><option>Nature</option><option>Historical</option><option>Entertainment</option><option>Retail</option><option>Hotel</option><option>Transit</option></select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-g-text-variant"><ChevronDown size={18} /></div></div></div>
                <div className="space-y-2"><label className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider ml-1">Priority</label><input type="number" min="1" max="5" value={newLoc.priority} onChange={e => setNewLoc({ ...newLoc, priority: parseInt(e.target.value) || 5 })} className="w-full py-4 px-5 bg-g-bg border border-g-outline/20 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" /></div>
              </div>
              <div className="px-8 mb-8">
                 <button onClick={handleAddLocation} className="w-full h-16 bg-g-primary text-white font-bold rounded-2xl shadow-elevation-2 hover:bg-blue-700 transition-colors duration-200 active:scale-95 ripple flex items-center justify-center">Add to Timeline</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
