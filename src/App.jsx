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
  5: 'bg-[#FFC107]/10 text-[#FFC107] border border-[#FFC107]/30',
  4: 'bg-zinc-950/40 text-zinc-300/60 border border-zinc-900/30',
  3: 'bg-zinc-950/40 text-zinc-300/60 border border-zinc-900/30',
  2: 'bg-zinc-950/40 text-zinc-300/60 border border-zinc-900/30',
  1: 'bg-zinc-950/40 text-zinc-300/60 border border-zinc-900/30',
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
  const [filterPriority, setFilterPriority] = useState(0);
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
    (loc.city.toLowerCase().includes(search.toLowerCase()) || loc.kanji.includes(search)) &&
    (filterPriority === 0 || loc.priority === filterPriority)
  ), [locations, search, filterPriority]);

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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#FFC107]/30 pb-20 overscroll-none">
      <div className="max-w-md mx-auto p-6">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2"><div className="w-1.5 h-6 bg-[#FFC107]" /><h1 className="text-xl font-black uppercase tracking-tighter">Onyx Itinerary</h1></div>
          <div className="flex gap-2">
            <button onClick={() => { triggerHaptic(); navigator.clipboard.writeText(localStorage.getItem('onyx_itinerary_locations')); alert("EXPORTED."); }} className="p-2 border border-white/10 rounded-xl hover:bg-[#FFC107]/20 transition-colors"><TrendingUp className="w-5 h-5 text-[#FFC107]" /></button>
            <button onClick={() => { triggerHaptic(); setIsAdding(true); }} className="p-2 bg-[#FFC107] rounded-xl hover:bg-[#FFC107]/80 transition-colors"><Plus className="w-5 h-5 text-black" /></button>
          </div>
        </header>

        <section className="mt-4 mb-10 relative overflow-hidden onyx-card p-8 border-[#FFC107]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC107]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <span className="text-[10px] font-bold text-[#FFC107] uppercase tracking-[0.4em] block mb-4">Tokyo // JST</span>
          <div className="text-6xl font-black tabular-nums tracking-tighter mb-2">{tokyoTime}</div>
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Destination // <span className="text-white">Japan</span></div>
            <div className="text-right"><span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Progress</span><span className="text-lg font-black text-[#FFC107]">{visitedCount}/{locations.length}</span></div>
          </div>
        </section>

        <div className="space-y-4 mb-8">
          <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} /><input type="text" placeholder="SEARCH DESTINATIONS..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-zinc-900/50 border border-zinc-900 w-full p-4 pl-12 rounded-lg text-xs font-bold tracking-widest focus:outline-none focus:border-[#FFC107] transition-colors" /></div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[0, 5, 4, 3, 2, 1].map(p => (
              <button key={p} onClick={() => { triggerHaptic(); setFilterPriority(p); }} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${filterPriority === p ? 'bg-[#FFC107] border-[#FFC107] text-black' : 'border-zinc-900 text-zinc-600'}`}>{p === 0 ? 'All' : `${p}/5 Priority`}</button>
            ))}
          </div>
        </div>

        <div className="onyx-card p-6 mb-10 bg-gradient-to-br from-zinc-900/50 to-transparent flex justify-between items-center">
          <div><span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Total Cost</span><div className="text-2xl font-black tabular-nums text-[#FFC107]">¥{totalBudget.toLocaleString()}</div></div>
          <TrendingUp size={32} className="text-zinc-800" />
        </div>

        <div className="space-y-8 relative">
          <div className="absolute left-[1.125rem] top-0 bottom-0 w-[1px] bg-zinc-900" />
          {filteredLocations.map((loc, idx) => (
            <motion.div key={loc.city} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="relative pl-12">
              <div className="absolute left-[-1.125rem] top-2 z-10"><div className={`w-3 h-3 rounded-full border-2 border-black transition-colors ${visited[loc.city] ? 'bg-[#FFC107]' : 'bg-zinc-800'}`} /></div>
              <div className={`onyx-card p-5 transition-all group ${visited[loc.city] ? 'opacity-40 border-dashed' : 'hover:border-[#FFC107]/30'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div onDoubleClick={() => handleDelete(loc.city)}><h3 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{loc.city}</h3><p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{loc.kanji}</p></div>
                  <button onClick={() => toggleVisited(loc.city)}>{visited[loc.city] ? <CheckCircle2 size={24} className="text-[#FFC107]" /> : <Circle size={24} className="text-zinc-900 group-hover:text-zinc-700" />}</button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-400"><Landmark size={10} /> {loc.category}</div>
                  <div className="text-[10px] font-black text-white tabular-nums">¥{loc.budget.toLocaleString()}</div>
                  <div className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-zinc-900 text-zinc-600'}`}>{loc.priority}/5</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-black p-8 flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
              <div className="flex justify-between items-center mb-12 pt-4"><h3 className="text-2xl font-black uppercase tracking-tighter">Add Destination</h3><button onClick={() => { triggerHaptic(); setIsAdding(false); }} className="text-zinc-600"><X size={32} /></button></div>
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">City Name</label><input type="text" value={newLoc.city} onChange={e => setNewLoc({ ...newLoc, city: e.target.value })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Kanji</label><input type="text" value={newLoc.kanji} onChange={e => setNewLoc({ ...newLoc, kanji: e.target.value })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Budget</label><input type="number" value={newLoc.budget} onChange={e => setNewLoc({ ...newLoc, budget: parseInt(e.target.value) || 0 })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label><div className="relative"><select value={newLoc.category} onChange={e => setNewLoc({ ...newLoc, category: e.target.value })} className="onyx-input appearance-none"><option>Urban</option><option>Nature</option><option>Historical</option><option>Entertainment</option></select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><ChevronDown size={14} /></div></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Priority</label><input type="number" min="1" max="5" value={newLoc.priority} onChange={e => setNewLoc({ ...newLoc, priority: parseInt(e.target.value) || 5 })} className="onyx-input" /></div>
              </div>
              <button onClick={handleAddLocation} className="h-16 bg-[#FFC107] text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-[#FFD54F] transition-all active:scale-95 mb-6">Execute Protocol</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
