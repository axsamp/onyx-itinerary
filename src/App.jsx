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
  5: 'bg-[#C084FC]/10 text-[#C084FC] border border-[#C084FC]/30',
  4: 'bg-violet-950/40 text-violet-300/60 border border-violet-900/30',
  3: 'bg-indigo-950/40 text-indigo-300/60 border border-indigo-900/30',
  2: 'bg-slate-950/40 text-slate-300/60 border border-slate-900/30',
  1: 'bg-zinc-950/40 text-zinc-300/60 border border-zinc-900/30',
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

  // Battery Optimization: Only update clock when visible
  useEffect(() => {
    let timer;
    const startTimer = () => {
      if (timer) clearInterval(timer);
      timer = setInterval(() => setTime(new Date()), 1000);
    };
    const stopTimer = () => clearInterval(timer);

    const handleVisibility = () => document.hidden ? stopTimer() : startTimer();
    document.addEventListener('visibilitychange', handleVisibility);
    startTimer();
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      stopTimer();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_locations', JSON.stringify(locations));
    localStorage.setItem('onyx_signal_count', locations.length); 
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_visited', JSON.stringify(visited));
  }, [visited]);

  const tokyoTime = useMemo(() => new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(time), [time]);

  const filteredLocations = useMemo(() => locations.filter(loc =>
    (loc.city.toLowerCase().includes(search.toLowerCase()) || loc.kanji.includes(search)) &&
    (filterPriority === 0 || loc.priority === filterPriority)
  ), [locations, search, filterPriority]);

  const totalBudget = useMemo(() => filteredLocations.reduce((acc, loc) => acc + (visited[loc.city] ? 0 : loc.budget), 0), [filteredLocations, visited]);
  const visitedCount = useMemo(() => Object.values(visited).filter(v => v).length, [visited]);

  const toggleVisited = useCallback((city) => {
    setVisited(prev => ({ ...prev, [city]: !prev[city] }));
  }, []);

  const handleAddLocation = () => {
    if (!newLoc.city) return;
    setLocations([...locations, { ...newLoc, description: newLoc.category }]);
    setNewLoc({ city: '', kanji: '', category: 'Urban', budget: 0, priority: 5 });
    setIsAdding(false);
  };

  const handleDelete = (city) => {
    if (window.confirm(`Remove ${city}?`)) setLocations(locations.filter(l => l.city !== city));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#C084FC]/30 pb-20 will-change-transform">
      <div className="max-w-md mx-auto p-6">
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#C084FC]" />
            <h1 className="text-xl font-black uppercase tracking-tighter">Onyx Itinerary</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { navigator.clipboard.writeText(localStorage.getItem('onyx_itinerary_locations')); alert("EXPORTED."); }} className="p-2 border border-white/10 rounded-xl hover:bg-[#C084FC]/20 transition-colors"><TrendingUp className="w-5 h-5 text-[#C084FC]" /></button>
            <button onClick={() => setIsAdding(true)} className="p-2 bg-[#C084FC] rounded-xl hover:bg-[#C084FC]/80 transition-colors"><Plus className="w-5 h-5 text-black" /></button>
          </div>
        </header>

        <section className="mt-4 mb-10 relative overflow-hidden onyx-card p-8 border-[#C084FC]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C084FC]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-[0.4em] block mb-4">Tokyo // JST</span>
          <div className="text-6xl font-black mono-number tracking-tighter mb-2">{tokyoTime}</div>
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Destination // <span className="text-white">Japan</span></div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Progress</span>
              <span className="text-lg font-black text-[#C084FC]">{visitedCount}/{locations.length}</span>
            </div>
          </div>
        </section>

        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input type="text" placeholder="SEARCH DESTINATIONS..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-zinc-900/50 border border-zinc-900 w-full p-4 pl-12 rounded-lg text-xs font-bold tracking-widest focus:outline-none focus:border-[#C084FC] transition-colors" />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[0, 5, 4, 3, 2].map(p => (
              <button key={p} onClick={() => setFilterPriority(p)} className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${filterPriority === p ? 'bg-[#C084FC] border-[#C084FC] text-black' : 'border-zinc-900 text-zinc-600'}`}>{p === 0 ? 'All' : `${p}/5 Priority`}</button>
            ))}
          </div>
        </div>

        <div className="onyx-card p-6 mb-10 bg-gradient-to-br from-zinc-900/50 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Total Cost</span>
              <div className="text-2xl font-black mono-number text-[#C084FC]">¥{totalBudget.toLocaleString()}</div>
            </div>
            <TrendingUp size={32} className="text-zinc-800" />
          </div>
        </div>

        <div className="relative">
          <div className="timeline-line" />
          <div className="space-y-8">
            {filteredLocations.map((loc, idx) => (
              <motion.div key={loc.city} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="relative pl-12">
                <div className="absolute left-[1.125rem] top-2"><div className={`timeline-dot ${visited[loc.city] ? 'bg-[#C084FC]' : ''}`} /></div>
                <div className={`onyx-card p-5 transition-all group ${visited[loc.city] ? 'opacity-40 border-dashed' : 'hover:border-[#C084FC]/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div onDoubleClick={() => handleDelete(loc.city)}>
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{loc.city}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{loc.kanji}</p>
                    </div>
                    <button onClick={() => toggleVisited(loc.city)}>{visited[loc.city] ? <CheckCircle2 size={24} className="text-[#C084FC]" /> : <Circle size={24} className="text-zinc-900 group-hover:text-zinc-700" />}</button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-400"><Landmark size={10} /> {loc.category}</div>
                    <div className="text-[10px] font-black text-white mono-number">¥{loc.budget.toLocaleString()}</div>
                    <div className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-zinc-900 text-zinc-600'}`}>{loc.priority}/5</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed inset-0 z-50 bg-black p-8 flex flex-col">
              <div className="flex justify-between items-center mb-12"><h3 className="text-2xl font-black uppercase tracking-tighter">Add Destination</h3><button onClick={() => setIsAdding(false)} className="text-zinc-600"><X size={32} /></button></div>
              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">City Name</label><input type="text" value={newLoc.city} onChange={e => setNewLoc({ ...newLoc, city: e.target.value })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Kanji</label><input type="text" value={newLoc.kanji} onChange={e => setNewLoc({ ...newLoc, kanji: e.target.value })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Budget</label><input type="number" value={newLoc.budget} onChange={e => setNewLoc({ ...newLoc, budget: parseInt(e.target.value) || 0 })} className="onyx-input" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label><div className="relative"><select value={newLoc.category} onChange={e => setNewLoc({ ...newLoc, category: e.target.value })} className="onyx-input appearance-none"><option>Urban</option><option>Nature</option><option>Historical</option><option>Entertainment</option></select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600"><ChevronDown size={14} /></div></div></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Priority</label><input type="number" min="2" max="5" value={newLoc.priority} onChange={e => setNewLoc({ ...newLoc, priority: parseInt(e.target.value) || 5 })} className="onyx-input" /></div>
              </div>
              <button onClick={handleAddLocation} className="h-14 bg-[#C084FC] text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4A5FF] transition-all active:scale-95">Execute Protocol</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
