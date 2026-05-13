import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Search, Filter, CheckCircle2, Circle, TrendingUp, Landmark, Plus, X, ChevronDown } from 'lucide-react';

const INITIAL_LOCATIONS = [
  { city: "Shizuoka", kanji: "静岡県", category: "Urban x Nature", budget: 40000, priority: 5, description: "Urban x Nature" },
  { city: "Nagoya", kanji: "名古屋", category: "Urban", budget: 30000, priority: 4, description: "Urban" },
  { city: "Tokyo Dome", kanji: "東京ドームシティ", category: "Entertainment", budget: 10000, priority: 2, description: "Entertainment" },
  { city: "Chiba", kanji: "千葉県", category: "Natural", budget: 15000, priority: 4, description: "Natural" },
  { city: "Yokohama", kanji: "横浜", category: "City", budget: 15000, priority: 2, description: "City" },
  { city: "Atami", kanji: "熱海市", category: "City", budget: 14000, priority: 3, description: "City" },
  { city: "Arakurayama Sengen Park", kanji: "新倉山浅間公園", category: "Nature", budget: 10000, priority: 3, description: "Nature" },
  { city: "Kawagoe", kanji: "川越", category: "Urban x Historical", budget: 15000, priority: 3, description: "Urban x Historical" },
  { city: "Mount Oyama", kanji: "大山", category: "Nature", budget: 10000, priority: 4, description: "Nature" },
  { city: "Jogasaki Coast", kanji: "城ヶ崎海岸", category: "Nature", budget: 12000, priority: 4, description: "Nature" },
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
    return saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
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
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_locations', JSON.stringify(locations));
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_visited', JSON.stringify(visited));
  }, [visited]);

  const tokyoTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tokyo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(time);

  const filteredLocations = locations.filter(loc => 
    (loc.city.toLowerCase().includes(search.toLowerCase()) || loc.kanji.includes(search)) &&
    (filterPriority === 0 || loc.priority === filterPriority)
  );

  const totalBudget = filteredLocations.reduce((acc, loc) => acc + (visited[loc.city] ? 0 : loc.budget), 0);
  const visitedCount = Object.values(visited).filter(v => v).length;

  const toggleVisited = (city) => {
    setVisited(prev => ({ ...prev, [city]: !prev[city] }));
  };

  const handleAddLocation = () => {
    if (!newLoc.city) return;
    setLocations([...locations, { ...newLoc, description: newLoc.category }]);
    setNewLoc({ city: '', kanji: '', category: 'Urban', budget: 0, priority: 5 });
    setIsAdding(false);
  };

  const handleDelete = (city) => {
    if (window.confirm(`Remove ${city} from itinerary?`)) {
      setLocations(locations.filter(l => l.city !== city));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#C084FC]/30 pb-20">
      <div className="max-w-md mx-auto p-6">
        
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-6 bg-[#C084FC]" />
            <h1 className="text-xl font-black uppercase tracking-tighter">Onyx Itinerary</h1>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="h-10 w-10 border border-zinc-900 flex items-center justify-center hover:border-[#C084FC] transition-colors"
          >
            <Plus size={20} />
          </button>
        </header>

        {/* Tokyo Clock Hero */}
        <section className="mt-4 mb-10 relative overflow-hidden onyx-card p-8 border-[#C084FC]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C084FC]/5 blur-3xl -mr-16 -mt-16 rounded-full" />
          <span className="text-[10px] font-bold text-[#C084FC] uppercase tracking-[0.4em] block mb-4">Tokyo // JST</span>
          <div className="text-6xl font-black mono-number tracking-tighter mb-2">{tokyoTime}</div>
          <div className="flex justify-between items-end">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              Destination // <span className="text-white">Japan</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Progress</span>
              <span className="text-lg font-black text-[#C084FC]">{visitedCount}/{locations.length}</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH DESTINATIONS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900/50 border border-zinc-900 w-full p-4 pl-12 rounded-lg text-xs font-bold tracking-widest focus:outline-none focus:border-[#C084FC] transition-colors"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[0, 5, 4, 3, 2].map(p => (
              <button 
                key={p} 
                onClick={() => setFilterPriority(p)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border whitespace-nowrap transition-all ${filterPriority === p ? 'bg-[#C084FC] border-[#C084FC] text-black' : 'border-zinc-900 text-zinc-600'}`}
              >
                {p === 0 ? 'All' : `${p}/5 Priority`}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="onyx-card p-6 mb-10 bg-gradient-to-br from-zinc-900/50 to-transparent">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1">Remaining Budget</span>
              <div className="text-2xl font-black mono-number text-[#C084FC]">¥{totalBudget.toLocaleString()}</div>
            </div>
            <TrendingUp size={32} className="text-zinc-800" />
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="timeline-line" />
          
          <div className="space-y-8">
            {filteredLocations.map((loc, idx) => (
              <motion.div 
                key={loc.city}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-12"
              >
                <div className="absolute left-[1.125rem] top-2">
                  <div className={`timeline-dot ${visited[loc.city] ? 'bg-[#C084FC]' : ''}`} />
                </div>

                <div className={`onyx-card p-5 transition-all group ${visited[loc.city] ? 'opacity-40 border-dashed' : 'hover:border-[#C084FC]/30'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div onDoubleClick={() => handleDelete(loc.city)}>
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-none mb-1">{loc.city}</h3>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{loc.kanji}</p>
                    </div>
                    <button onClick={() => toggleVisited(loc.city)}>
                      {visited[loc.city] ? <CheckCircle2 size={24} className="text-[#C084FC]" /> : <Circle size={24} className="text-zinc-900 group-hover:text-zinc-700" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 rounded text-[9px] font-bold uppercase text-zinc-400">
                      <Landmark size={10} />
                      {loc.category}
                    </div>
                    <div className="text-[10px] font-black text-white mono-number">¥{loc.budget.toLocaleString()}</div>
                    <div className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-zinc-900 text-zinc-600'}`}>
                      {loc.priority}/5
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Add Modal */}
        <AnimatePresence>
          {isAdding && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed inset-0 z-50 bg-black p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Add Destination</h3>
                <button onClick={() => setIsAdding(false)} className="text-zinc-600"><X size={32} /></button>
              </div>

              <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">City Name</label>
                  <input type="text" placeholder="e.g. Nara" value={newLoc.city} onChange={e => setNewLoc({...newLoc, city: e.target.value})} className="onyx-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Kanji / Translation</label>
                  <input type="text" placeholder="e.g. 奈良市" value={newLoc.kanji} onChange={e => setNewLoc({...newLoc, kanji: e.target.value})} className="onyx-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Budget (JPY)</label>
                  <input type="number" value={newLoc.budget} onChange={e => setNewLoc({...newLoc, budget: parseInt(e.target.value) || 0})} className="onyx-input" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Category</label>
                  <div className="relative">
                    <select value={newLoc.category} onChange={e => setNewLoc({...newLoc, category: e.target.value})} className="onyx-input appearance-none">
                      <option>Urban</option>
                      <option>Nature</option>
                      <option>Historical</option>
                      <option>Entertainment</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Priority (2-5)</label>
                  <input type="number" min="2" max="5" value={newLoc.priority} onChange={e => setNewLoc({...newLoc, priority: parseInt(e.target.value) || 5})} className="onyx-input" />
                </div>
              </div>

              <button 
                onClick={handleAddLocation}
                className="h-14 bg-[#C084FC] text-black font-black uppercase tracking-[0.2em] text-xs hover:bg-[#D4A5FF] transition-colors"
              >
                Execute Protocol
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
