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

function LatticeMapCanvas({ locations, visited }) {
  const canvasRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);

  // Auto-scroll to center the active unvisited destination on mount or update
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container || locations.length === 0) return;
      
      const firstUnvisitedIdx = locations.findIndex(loc => !visited[loc.city]);
      const targetIdx = firstUnvisitedIdx === -1 ? locations.length - 1 : firstUnvisitedIdx;
      
      const totalWidth = Math.max(380, locations.length * 105);
      const segmentWidth = (totalWidth - 60) / Math.max(1, locations.length - 1);
      const x = 30 + (targetIdx * segmentWidth);
      
      const viewportWidth = container.clientWidth;
      container.scrollTo({
        left: x - viewportWidth / 2,
        behavior: 'smooth'
      });
    }, 200);

    return () => clearTimeout(timer);
  }, [locations, visited]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const dpr = window.devicePixelRatio || 1;
    const canvasWidth = Math.max(380, locations.length * 105);
    canvas.width = canvasWidth * dpr;
    canvas.height = 160 * dpr;
    ctx.scale(dpr, dpr);

    // Friendly Material 3 short name formatter to prevent horizontal crowded labels
    const getShortName = (city) => {
      let name = city;
      if (name.includes(' - ')) {
        name = name.split(' - ')[0];
      }
      const words = name.split(' ');
      if (words.length > 2) {
        name = words.slice(0, 2).join(' ');
      }
      if (name.length > 12) {
        name = name.slice(0, 11) + '…';
      }
      return name;
    };

    if (locations.length === 0) {
      ctx.clearRect(0, 0, canvasWidth, 160);
      return;
    }

    const nodes = locations.map((loc, idx) => {
      let hash = 0;
      for (let i = 0; i < loc.city.length; i++) {
        hash = loc.city.charCodeAt(i) + ((hash << 5) - hash);
      }
      const segmentWidth = (canvasWidth - 60) / Math.max(1, locations.length - 1);
      const x = 30 + (idx * segmentWidth) + (Math.abs(hash % 8) - 4);
      
      const verticalTiers = [45, 80, 115];
      const tierIndex = idx % 3;
      const y = verticalTiers[tierIndex] + (Math.abs(hash % 10) - 5);

      return {
        id: loc.city,
        name: getShortName(loc.city),
        x,
        y,
        tierIndex,
        visited: !!visited[loc.city],
        priority: loc.priority
      };
    });

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvasWidth, 160);
      pulse += 0.04;

      ctx.strokeStyle = document.documentElement.classList.contains('dark') 
        ? 'rgba(138, 180, 248, 0.03)' 
        : 'rgba(11, 87, 208, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 16;
      for (let x = 0; x < canvasWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 160);
        ctx.stroke();
      }
      for (let y = 0; y < 160; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }

      if (nodes.length > 1) {
        for (let i = 0; i < nodes.length - 1; i++) {
          const from = nodes[i];
          const to = nodes[i + 1];
          
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = from.visited && to.visited
            ? (document.documentElement.classList.contains('dark') ? 'rgba(138, 180, 248, 0.06)' : 'rgba(11, 87, 208, 0.08)')
            : 'rgba(196, 199, 197, 0.03)';
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = from.visited && to.visited
            ? (document.documentElement.classList.contains('dark') ? 'rgba(138, 180, 248, 0.4)' : 'rgba(11, 87, 208, 0.4)')
            : (document.documentElement.classList.contains('dark') ? 'rgba(95, 99, 104, 0.2)' : 'rgba(196, 199, 197, 0.3)');
          ctx.lineWidth = 1.5;
          ctx.stroke();

          const isLineActive = from.visited && !to.visited;
          if (isLineActive) {
            const progress = (pulse * 0.05 + (i * 0.15)) % 1;
            const px = from.x + (to.x - from.x) * progress;
            const py = from.y + (to.y - from.y) * progress;
            
            const opacity = 1 - Math.pow(progress - 0.5, 2) * 4;
            ctx.fillStyle = document.documentElement.classList.contains('dark') 
              ? `rgba(138, 180, 248, ${opacity})` 
              : `rgba(11, 87, 208, ${opacity})`;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      nodes.forEach(node => {
        if (!node.visited) {
          const glow = Math.abs(Math.sin(pulse + node.x * 0.05)) * 3 + 1;
          ctx.fillStyle = 'rgba(196, 199, 197, 0.06)';
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6 + glow, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = node.visited 
          ? (document.documentElement.classList.contains('dark') ? '#8AB4F8' : '#0B57D0')
          : (document.documentElement.classList.contains('dark') ? '#5F6368' : '#C4C7C5');
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.visited ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (node.priority === 5 && !node.visited) {
          ctx.strokeStyle = 'rgba(196, 199, 197, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 7.5, 0, Math.PI * 2);
          ctx.stroke();
        }

        const isLabelAbove = node.tierIndex !== 1;
        const textY = isLabelAbove ? node.y - 12 : node.y + 16;

        ctx.fillStyle = node.visited 
          ? (document.documentElement.classList.contains('dark') ? '#E8EAED' : '#1F1F1F')
          : (document.documentElement.classList.contains('dark') ? '#9AA0A6' : '#444746');
        ctx.font = 'bold 8.5px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, textY);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [locations, visited]);

  return (
    <div className="material-card p-5 mb-8 shadow-elevation-1 border-g-outline/10 relative overflow-hidden bg-g-surface rounded-[32px]">
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-g-primary animate-pulse" />
          <span className="text-[10px] font-bold text-g-text-variant uppercase tracking-widest block">Travel Route Map</span>
        </div>
        <span className="text-[8.5px] text-g-primary bg-g-primary-container px-2 py-0.5 rounded-full font-bold">Active Route</span>
      </div>
      <div ref={scrollContainerRef} className="overflow-x-auto no-scrollbar -mx-5 px-5">
        <div style={{ width: `${Math.max(380, locations.length * 105)}px` }} className="h-40 relative">
          <canvas ref={canvasRef} className="w-full h-full bg-g-bg/50 rounded-2xl border border-g-outline/5" style={{ display: 'block' }} />
        </div>
      </div>
    </div>
  );
}

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
                Active • Travel Planner
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => { triggerHaptic(); setIsAdding(true); }} 
              className="w-14 h-14 rounded-[20px] rounded-bl-[8px] bg-g-primary text-white dark:text-[#202124] flex items-center justify-center hover:brightness-110 transition-all duration-300 shadow-elevation-2 active:scale-95 ripple"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
            <button
              onClick={() => { triggerHaptic('medium'); setIsProfileOpen(true); }}
              className="w-14 h-14 rounded-[20px] rounded-br-[8px] bg-g-aluminium/50 dark:bg-g-aluminium/10 text-g-primary flex items-center justify-center font-display font-black text-sm tracking-widest hover:bg-g-primary-container hover:text-g-primary transition-all duration-300 active:scale-90 ripple shrink-0 border border-g-outline/10 shadow-sm"
            >
              JD
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



        {/* Geographic Lattice Network Canvas */}
        <LatticeMapCanvas locations={filteredLocations} visited={visited} />

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

              {/* Dynamic Transit Railroad Connector */}
              {idx < filteredLocations.length - 1 && (
                <div className="relative my-4 pl-4 flex items-center gap-3">
                  <div className="absolute left-[-1.0625rem] top-1/2 -translate-y-1/2 flex flex-col items-center justify-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-g-primary/40" />
                    <span className="w-1 h-1 rounded-full bg-g-primary/40" />
                    <span className="w-1 h-1 rounded-full bg-g-primary/40" />
                  </div>
                  <div className="flex items-center gap-2 px-3.5 py-1.5 bg-g-aluminium/20 dark:bg-g-aluminium/5 rounded-xl border border-g-outline/10 text-[9px] font-bold uppercase tracking-wider text-g-text-variant select-none">
                    <Clock size={10} className="text-g-primary shrink-0 animate-pulse" />
                    <span>JR Estimate: ~{((loc.city.length * 3) % 25) + 12}m • ¥{((loc.city.length * 40) % 280) + 160}</span>
                  </div>
                </div>
              )}
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

        {/* Profile Modal */}
        <AnimatePresence>
          {isProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:p-6">
              {/* Dark Backing Blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsProfileOpen(false)}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />

              {/* Frosted Glass Bottom Sheet Dialog */}
              <motion.div
                initial={{ opacity: 0, y: '100%' }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="relative w-full max-w-lg bg-white/70 dark:bg-g-surface/70 backdrop-blur-xl border border-g-outline/15 rounded-t-[40px] rounded-b-[24px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header status bar */}
                <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-g-primary animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">Travel Profile</span>
                  </div>
                  <button
                    onClick={() => { triggerHaptic('light'); setIsProfileOpen(false); }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="space-y-5">
                  {/* Traveler Details Card */}
                  <div className="p-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/10 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[16px] rounded-bl-[6px] bg-g-primary-container text-g-primary flex items-center justify-center font-display font-black text-lg">
                      JD
                    </div>
                    <div>
                      <div className="text-sm font-bold text-g-text">JD</div>
                      <div className="text-[10px] font-medium text-g-text-variant uppercase tracking-wider">Primary Traveler</div>
                    </div>
                  </div>

                  {/* Budget Card */}
                  <div className="p-6 bg-g-primary-container/10 border border-g-primary/10 rounded-2xl">
                    <span className="text-[9px] font-bold text-g-primary uppercase tracking-[0.2em] block mb-2">Total Remaining Budget</span>
                    <div className="text-3.5xl font-black tracking-tight text-g-primary font-display mb-1.5 leading-none">
                      ¥{totalBudget.toLocaleString()}
                    </div>
                    <p className="text-[10px] font-medium text-g-text-variant leading-relaxed">
                      The sum of your planned budget for all pending (unvisited) locations on your itinerary.
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => { triggerHaptic('medium'); setIsProfileOpen(false); }}
                  className="w-full py-4 bg-g-primary text-white dark:text-[#202124] font-bold rounded-2xl shadow-elevation-2 hover:bg-g-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ripple mt-4"
                >
                  <span>Close Profile</span>
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
