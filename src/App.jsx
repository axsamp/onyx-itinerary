import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Clock, Search, Filter, CheckCircle2, Circle, TrendingUp, 
  Landmark, Plus, X, ChevronDown, Trash2, ArrowUpRight, ArrowRight, 
  Navigation, Globe, Activity, BookOpen, AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Literal open source Material Design web components
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
import '@material/web/switch/switch.js';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const INITIAL_LOCATIONS = [
  { city: "Montbell", kanji: "モンベル", category: "Retail", budget: 0, priority: 5, description: "Outdoor gear & apparel", lat: 35.6580, lng: 139.7016, arrivalDate: "2026-05-18", arrivalTime: "12:00", departureTime: "13:30", stamp: null, notes: "" },
  { city: "mont-bell Yokohama Shin-Yamashita", kanji: "モンベル 横浜しん山下", category: "Retail", budget: 0, priority: 4, description: "Shin-Yamashita Store", lat: 35.4385, lng: 139.6644, arrivalDate: "2026-05-19", arrivalTime: "14:00", departureTime: "16:00", stamp: null, notes: "" },
  { city: "Cerulean Tower Tokyu Hotel", kanji: "セルリアンタワー東急ホテル", category: "Hotel", budget: 0, priority: 5, description: "Main Base - Shibuya", lat: 35.6563, lng: 139.6995, arrivalDate: "2026-05-18", arrivalTime: "15:00", departureTime: "23:59", stamp: null, notes: "" },
  { city: "Hase Station", kanji: "長谷駅", category: "Transit", budget: 0, priority: 3, description: "Kamakura access", lat: 35.3112, lng: 139.5358, arrivalDate: "2026-05-20", arrivalTime: "09:30", departureTime: "10:30", stamp: null, notes: "" },
  { city: "OIMACHI TRACKS", kanji: "大井町トラックス", category: "Retail", budget: 0, priority: 3, description: "Shopping area", lat: 35.6064, lng: 139.7346, arrivalDate: "2026-05-18", arrivalTime: "18:00", departureTime: "20:00", stamp: null, notes: "" },
  { city: "Nihombashi Mitsukoshi Main Store", kanji: "日本橋三越本店", category: "Retail", budget: 0, priority: 4, description: "Luxury department store", lat: 35.6856, lng: 139.7731, arrivalDate: "2026-05-21", arrivalTime: "11:00", departureTime: "13:00", stamp: null, notes: "" },
  { city: "Laforet Harajuku", kanji: "ラフォーレ原宿", category: "Retail", budget: 0, priority: 4, description: "Harajuku fashion hub", lat: 35.6698, lng: 139.7049, arrivalDate: "2026-05-21", arrivalTime: "15:00", departureTime: "17:00", stamp: null, notes: "" },
  { city: "Pensta Ecute Ueno", kanji: "ペンスタ エキュート上野", category: "Retail", budget: 0, priority: 2, description: "Suica Penguin goods", lat: 35.7144, lng: 139.7768, arrivalDate: "2026-05-22", arrivalTime: "10:00", departureTime: "11:00", stamp: null, notes: "" },
  { city: "FREAK'S STORE Shinjuku", kanji: "フリークスストア", category: "Retail", budget: 0, priority: 4, description: "Lumineesutoshinjukuwimenzuten", lat: 35.6905, lng: 139.7020, arrivalDate: "2026-05-22", arrivalTime: "14:00", departureTime: "16:00", stamp: null, notes: "" },
  { city: "AGILITY Nippori Leather", kanji: "AGILITY日暮里革工房", category: "Retail", budget: 0, priority: 4, description: "Leather goods workshop", lat: 35.7275, lng: 139.7701, arrivalDate: "2026-05-23", arrivalTime: "13:00", departureTime: "15:00", stamp: null, notes: "" },
  { city: "Higashirinkan", kanji: "東林間", category: "Location", budget: 0, priority: 3, description: "3 Chome-18-3", lat: 35.5186, lng: 139.4357, arrivalDate: "2026-05-19", arrivalTime: "18:00", departureTime: "20:00", stamp: null, notes: "" },
  { city: "Mu (Nothingness)", kanji: "無", category: "Location", budget: 0, priority: 5, description: "Philosophy node", lat: 35.6580, lng: 139.7016, arrivalDate: "", arrivalTime: "", departureTime: "", stamp: null, notes: "" },
  { city: "Narita International Airport", kanji: "成田国際空港", category: "Transit", budget: 0, priority: 5, description: "Entry/Exit Node", lat: 35.7720, lng: 140.3929, arrivalDate: "2026-05-18", arrivalTime: "08:00", departureTime: "09:30", stamp: null, notes: "" },
  { city: "Red Roof Inn Kamata", kanji: "レッドルーフイン蒲田", category: "Hotel", budget: 0, priority: 5, description: "Kamata base", lat: 35.5604, lng: 139.7153, arrivalDate: "2026-05-19", arrivalTime: "21:00", departureTime: "09:00", stamp: null, notes: "" },
  { city: "Shizuoka", kanji: "静岡県", category: "Urban x Nature", budget: 40000, priority: 5, description: "Urban x Nature", lat: 34.9756, lng: 138.3828, arrivalDate: "2026-05-24", arrivalTime: "10:00", departureTime: "18:00", stamp: null, notes: "" },
  { city: "Nagoya", kanji: "名古屋", category: "Urban", budget: 30000, priority: 4, description: "Urban", lat: 35.1815, lng: 136.9066, arrivalDate: "2026-05-25", arrivalTime: "11:00", departureTime: "19:00", stamp: null, notes: "" },
  { city: "Tokyo Dome", kanji: "東京ドームシティ", category: "Entertainment", budget: 10000, priority: 2, description: "Entertainment", lat: 35.7056, lng: 139.7519, arrivalDate: "2026-05-23", arrivalTime: "18:00", departureTime: "21:30", stamp: null, notes: "" },
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

// Precise Haversine distance calculator
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

export default function App() {
  const [locations, setLocations] = useState(() => {
    const saved = localStorage.getItem('onyx_itinerary_locations');
    const current = saved ? JSON.parse(saved) : INITIAL_LOCATIONS;
    // Backwards compatibility layer to inject lat, lng, and scheduling properties if absent
    const enrichedCurrent = current.map(item => {
      const initMatch = INITIAL_LOCATIONS.find(l => l.city === item.city) || {};
      return {
        lat: initMatch.lat || 35.6563 + (Math.random() - 0.5) * 0.05,
        lng: initMatch.lng || 139.6995 + (Math.random() - 0.5) * 0.05,
        arrivalDate: "",
        arrivalTime: "",
        departureTime: "",
        stamp: null,
        notes: "",
        ...initMatch,
        ...item
      };
    });

    const merged = [...enrichedCurrent];
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
  
  // Navigation states
  const [activeTab, setActiveTab] = useState('destinations'); // 'destinations' | 'schedule' | 'geofence'
  const [expandedCard, setExpandedCard] = useState(null); // String name of expanded location
  const [selectedStampColor, setSelectedStampColor] = useState('#D32F2F'); // Vermilion red default
  
  // Geofencing GPS States
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulatedCoords, setSimulatedCoords] = useState({ lat: 35.7720, lng: 140.3929 }); // Start at Narita Airport
  const [realCoords, setRealCoords] = useState(null);
  const [geofenceRadius, setGeofenceRadius] = useState(150); // meters
  const [showCheckInOverlay, setShowCheckInOverlay] = useState(null);

  const [newLoc, setNewLoc] = useState({ 
    city: '', kanji: '', category: 'Urban', budget: 0, priority: 5,
    lat: '', lng: '', arrivalDate: '', arrivalTime: '', departureTime: '' 
  });
  
  const [isStealthMode, setIsStealthMode] = useState(() => localStorage.getItem('onyx_stealth_mode') === 'true');

  // Unified Cross-App Theme Synchronization
  useEffect(() => {
    const THEME_PALETTES = {
      cobalt: {
        light: { primary: '#0B57D0', primaryContainer: '#D3E3FD', bg: '#F0F4F8', surface: '#FFFFFF', onSurface: '#1F1F1F', outline: '#C4C7C5', aluminium: '#E8EAED' },
        dark: { primary: '#8AB4F8', primaryContainer: '#3C4043', bg: '#202124', surface: '#303134', onSurface: '#E8EAED', outline: '#5F6368', aluminium: '#282A2D' }
      },
      vermilion: {
        light: { primary: '#A83827', primaryContainer: '#FFDAD3', bg: '#FFF8F6', surface: '#FFF8F6', onSurface: '#231A18', outline: '#857370', aluminium: '#F5DED9' },
        dark: { primary: '#FFB4A7', primaryContainer: '#862112', bg: '#1A1110', surface: '#1A1110', onSurface: '#F1DFDA', outline: '#A08C89', aluminium: '#534340' }
      },
      matcha: {
        light: { primary: '#4C662B', primaryContainer: '#CDEDA3', bg: '#F8FAF2', surface: '#FFFFFF', onSurface: '#1A1C16', outline: '#74796A', aluminium: '#E8EAED' },
        dark: { primary: '#B2D189', primaryContainer: '#354E16', bg: '#11140E', surface: '#1A1D16', onSurface: '#E3E3DA', outline: '#8E9285', aluminium: '#282A2D' }
      },
      sakura: {
        light: { primary: '#B326B3', primaryContainer: '#FAD2FA', bg: '#FAF2FA', surface: '#FFFFFF', onSurface: '#263238', outline: '#B0BEC5', aluminium: '#E8EAED' },
        dark: { primary: '#E1BEE7', primaryContainer: '#4A148C', bg: '#1A0E1A', surface: '#2D1F2D', onSurface: '#F3E5F5', outline: '#7B1FA2', aluminium: '#282A2D' }
      },
      yuzu: {
        light: { primary: '#7E5700', primaryContainer: '#FFE086', bg: '#FFF8EE', surface: '#FFF8EE', onSurface: '#1E1B13', outline: '#7C7767', aluminium: '#F6E0BB' },
        dark: { primary: '#FABD00', primaryContainer: '#5F4100', bg: '#16130B', surface: '#16130B', onSurface: '#F1DFDA', outline: '#969080', aluminium: '#53462A' }
      },
      titanium: {
        light: { primary: '#5A626A', primaryContainer: '#E2E7EC', bg: '#F1F3F5', surface: '#FFFFFF', onSurface: '#1E2022', outline: '#70777A', aluminium: '#CFD4DA' },
        dark: { primary: '#CFD4DA', primaryContainer: '#2D3238', bg: '#1E2022', surface: '#2D3238', onSurface: '#F1F3F5', outline: '#8E9598', aluminium: '#1A1A1A' }
      },
      abyss: {
        light: { primary: '#006C5B', primaryContainer: '#59FCE1', bg: '#F4FEFA', surface: '#FFFFFF', onSurface: '#00201A', outline: '#6F7977', aluminium: '#CCEBE5' },
        dark: { primary: '#59FCE1', primaryContainer: '#005043', bg: '#001511', surface: '#00201A', onSurface: '#E6FFF9', outline: '#899391', aluminium: '#00372E' }
      }
    };

    const applyTheme = () => {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      const urlStealth = params.get('stealth');

      if (urlTheme) localStorage.setItem('onyx_theme', urlTheme);
      if (urlStealth) localStorage.setItem('onyx_stealth_mode', urlStealth);

      const themeName = localStorage.getItem('onyx_theme') || 'cobalt';
      const isDark = localStorage.getItem('onyx_stealth_mode') === 'true';

      setIsStealthMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const activePalette = THEME_PALETTES[themeName] || THEME_PALETTES.cobalt;
      const colors = isDark ? activePalette.dark : activePalette.light;

      const root = document.documentElement;
      root.style.setProperty('--theme-g-primary', colors.primary);
      root.style.setProperty('--theme-g-primary-container', colors.primaryContainer);
      root.style.setProperty('--theme-g-bg', colors.bg);
      root.style.setProperty('--theme-g-surface', colors.surface);
      root.style.setProperty('--theme-g-text', colors.onSurface || (isDark ? '#E8EAED' : '#1F1F1F'));
      root.style.setProperty('--theme-g-text-variant', isDark ? '#9AA0A6' : '#444746');
      root.style.setProperty('--theme-g-outline', colors.outline);
      root.style.setProperty('--theme-g-aluminium', colors.aluminium);
    };

    applyTheme();

    const handleStorage = (e) => {
      if (e.key === 'onyx_stealth_mode' || e.key === 'onyx_theme') {
        applyTheme();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Time ticks
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

  // Sync state
  useEffect(() => {
    localStorage.setItem('onyx_itinerary_locations', JSON.stringify(locations));
    localStorage.setItem('onyx_itinerary_node_count', locations.length.toString()); 
  }, [locations]);

  useEffect(() => {
    localStorage.setItem('onyx_itinerary_visited', JSON.stringify(visited));
  }, [visited]);

  // GPS Watcher
  useEffect(() => {
    if (isSimulating) return;

    let watchId;
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setRealCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("GPS telemetry error:", error);
        },
        { enableHighAccuracy: true }
      );
    }
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isSimulating]);

  const activeLat = isSimulating ? simulatedCoords.lat : (realCoords?.lat || 35.6895);
  const activeLng = isSimulating ? simulatedCoords.lng : (realCoords?.lng || 139.6917);

  // Real-Time Geofence checking loop
  useEffect(() => {
    locations.forEach(loc => {
      if (visited[loc.city]) return;

      const dist = getHaversineDistance(activeLat, activeLng, loc.lat, loc.lng);
      if (dist <= geofenceRadius) {
        triggerHaptic('heavy');
        setVisited(prev => ({ ...prev, [loc.city]: true }));
        setShowCheckInOverlay(loc);
        setTimeout(() => {
          setShowCheckInOverlay(null);
        }, 4000);
      }
    });
  }, [activeLat, activeLng, locations, visited, geofenceRadius]);

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
    const latVal = parseFloat(newLoc.lat) || (35.6895 + (Math.random() - 0.5) * 0.05);
    const lngVal = parseFloat(newLoc.lng) || (139.6917 + (Math.random() - 0.5) * 0.05);
    
    setLocations([...locations, { 
      ...newLoc, 
      lat: latVal,
      lng: lngVal,
      arrivalDate: newLoc.arrivalDate || "",
      arrivalTime: newLoc.arrivalTime || "",
      departureTime: newLoc.departureTime || "",
      stamp: null,
      notes: "",
      description: newLoc.category 
    }]);
    setNewLoc({ 
      city: '', kanji: '', category: 'Urban', budget: 0, priority: 5,
      lat: '', lng: '', arrivalDate: '', arrivalTime: '', departureTime: '' 
    });
    setIsAdding(false);
  };

  const handleDelete = (city) => {
    triggerHaptic('heavy');
    setLocations(locations.filter(l => l.city !== city));
  };

  // Updaters for expanded card inputs
  const updateLocationField = (city, field, value) => {
    setLocations(prev => prev.map(loc => {
      if (loc.city === city) {
        return { ...loc, [field]: value };
      }
      return loc;
    }));
  };

  // Eki stamp creator
  const applyEkiStamp = (city) => {
    triggerHaptic('heavy');
    const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
    updateLocationField(city, 'stamp', {
      date: today,
      color: selectedStampColor,
      type: 'torii'
    });
  };

  // Chronological Scheduled timesheet parser
  const scheduledLocations = useMemo(() => {
    return locations
      .filter(l => l.arrivalDate)
      .sort((a, b) => {
        const dateCompare = a.arrivalDate.localeCompare(b.arrivalDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.arrivalTime || "").localeCompare(b.arrivalTime || "");
      });
  }, [locations]);

  // Formatter for calendar JST labels
  const formatDateLabel = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' });
    } catch(e) {
      return dateStr;
    }
  };

  // Overlap checker between scheduled blocks
  const hasConflict = (currentLoc, index) => {
    if (index === 0) return false;
    const prevLoc = scheduledLocations[index - 1];
    if (prevLoc.arrivalDate !== currentLoc.arrivalDate) return false;
    
    // Convert times to numeric minutes to check overlapping boundaries
    const getMinutes = (tStr) => {
      if (!tStr) return 0;
      const [h, m] = tStr.split(':').map(Number);
      return h * 60 + m;
    };
    
    const prevEnd = getMinutes(prevLoc.departureTime || prevLoc.arrivalTime);
    const currStart = getMinutes(currentLoc.arrivalTime);
    return currStart < prevEnd;
  };

  // Geofence distances sorter
  const sortedDistanceLocations = useMemo(() => {
    return locations
      .filter(l => !visited[l.city])
      .map(loc => {
        const dist = getHaversineDistance(activeLat, activeLng, loc.lat, loc.lng);
        return { ...loc, distance: dist };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [locations, visited, activeLat, activeLng]);

  return (
    <div className="min-h-screen bg-g-bg text-g-text font-sans selection:bg-g-primary-container pb-32 overscroll-none transition-colors duration-700">
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
              className="w-14 h-14 rounded-[20px] rounded-bl-[8px] bg-g-primary text-white dark:text-[#202124] flex items-center justify-center hover:brightness-110 transition-all duration-300 shadow-elevation-2 active:scale-95 ripple relative overflow-hidden"
            >
              <md-ripple></md-ripple>
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>
            <button
              onClick={() => { triggerHaptic('medium'); setIsProfileOpen(true); }}
              className="w-14 h-14 rounded-[20px] rounded-br-[8px] bg-g-aluminium/50 dark:bg-g-aluminium/10 text-g-primary flex items-center justify-center font-display font-black text-sm tracking-widest hover:bg-g-primary-container hover:text-g-primary transition-all duration-300 active:scale-90 ripple shrink-0 border border-g-outline/10 shadow-sm relative overflow-hidden"
            >
              <md-ripple></md-ripple>
              JD
            </button>
          </div>
        </header>

        {/* Tab-Controlled Content Panel with responsive M3 Spring Animations */}
        <AnimatePresence mode="wait">
          {activeTab === 'destinations' && (
            <motion.div
              key="destinations"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
            >
              {/* Material 3 Expressive Core Metric Display */}
              <section className="mt-4 mb-6 relative overflow-hidden material-card p-8 border-g-primary/10 shadow-elevation-2 rounded-[32px] rounded-bl-[8px]">
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

              {/* Search bar */}
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

              {/* Expandable Destinations Timeline List */}
              <div className="space-y-6 relative">
                <div className="absolute left-[1.125rem] top-0 bottom-0 w-[2px] bg-g-outline/15" />
                {filteredLocations.map((loc, idx) => {
                  const isExpanded = expandedCard === loc.city;
                  return (
                    <motion.div 
                      key={loc.city} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: idx * 0.02, type: "spring", damping: 20, stiffness: 200 }} 
                      className="relative pl-12"
                    >
                      <div className="absolute left-[-1.125rem] top-4.5 z-10">
                        <div className={`w-3.5 h-3.5 rounded-full border-2 border-g-bg transition-all duration-300 ${visited[loc.city] ? 'bg-g-primary scale-110 shadow-sm' : 'bg-g-outline scale-100'}`} />
                      </div>
                      
                      <div className={cn(
                        "material-card p-5 transition-all shadow-sm ripple group relative overflow-hidden",
                        visited[loc.city] ? 'opacity-65 border-dashed bg-g-bg/50' : 'hover:border-g-primary/30',
                        idx % 2 === 0 ? "rounded-[32px] rounded-br-[8px]" : "rounded-[32px] rounded-bl-[8px]"
                      )}>
                        
                        {/* Upper row details */}
                        <div className="flex justify-between items-start mb-2 relative z-10">
                          <div className="cursor-pointer flex-1 min-w-0" onClick={() => { triggerHaptic('light'); setExpandedCard(isExpanded ? null : loc.city); }}>
                            <h3 className="text-lg font-black tracking-tight leading-none mb-1.5 font-display text-g-text group-hover:text-g-primary transition-colors">{loc.city}</h3>
                            <p className="text-[11px] font-bold text-g-text-variant uppercase tracking-wider">{loc.kanji || 'PENDING KANJI'}</p>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Expand toggle */}
                            <button
                              onClick={() => { triggerHaptic('light'); setExpandedCard(isExpanded ? null : loc.city); }}
                              className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary transition-transform duration-200 relative overflow-hidden"
                              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                            >
                              <md-ripple></md-ripple>
                              <ChevronDown size={18} />
                            </button>
                            
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.city + (loc.kanji ? ' ' + loc.kanji : ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => triggerHaptic('medium')}
                              className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary hover:bg-g-primary-container transition-all cursor-pointer relative overflow-hidden"
                              title="View in Google Maps"
                            >
                              <md-ripple></md-ripple>
                              <ArrowUpRight size={18} />
                            </a>
                            
                            <button 
                              onClick={() => toggleVisited(loc.city)} 
                              className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary transition-colors cursor-pointer relative overflow-hidden"
                            >
                              <md-ripple></md-ripple>
                              {visited[loc.city] ? <CheckCircle2 size={20} className="text-g-primary" /> : <Circle size={20} className="text-g-outline group-hover:text-g-primary/50" />}
                            </button>
                          </div>
                        </div>

                        {/* Interactive Expandable Sub-Console with Material Spring */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ type: "spring", damping: 25, stiffness: 220 }}
                              className="overflow-hidden mt-3 pt-3 border-t border-g-outline/10 space-y-4 relative z-10"
                            >
                              {/* JST Travel Time Slots Setting */}
                              <div className="grid grid-cols-3 gap-2.5">
                                <div>
                                  <label className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block mb-1">Set Date</label>
                                  <input 
                                    type="date"
                                    value={loc.arrivalDate || ""}
                                    onChange={(e) => updateLocationField(loc.city, 'arrivalDate', e.target.value)}
                                    className="w-full bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl p-2.5 text-[11px] text-g-text font-bold focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block mb-1">Arrival JST</label>
                                  <input 
                                    type="time"
                                    value={loc.arrivalTime || ""}
                                    onChange={(e) => updateLocationField(loc.city, 'arrivalTime', e.target.value)}
                                    className="w-full bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl p-2.5 text-[11px] text-g-text font-bold focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block mb-1">Depart JST</label>
                                  <input 
                                    type="time"
                                    value={loc.departureTime || ""}
                                    onChange={(e) => updateLocationField(loc.city, 'departureTime', e.target.value)}
                                    className="w-full bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl p-2.5 text-[11px] text-g-text font-bold focus:outline-none"
                                  />
                                </div>
                              </div>

                              {/* Editable Travel Journal Notes */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block">Travel Log Notes</label>
                                <textarea
                                  placeholder="Type notes (bought items, check-in instructions, address)..."
                                  value={loc.notes || ""}
                                  onChange={(e) => updateLocationField(loc.city, 'notes', e.target.value)}
                                  rows={2}
                                  className="w-full bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl p-3 text-xs text-g-text font-medium focus:outline-none placeholder:text-g-text-variant/40"
                                />
                              </div>

                              {/* Eki-Stamp Collection ink-pad */}
                              <div className="pt-3 border-t border-g-outline/10">
                                <label className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block mb-2">Japanese Stamp Station Seal</label>
                                <div className="flex items-center gap-3">
                                  <div className="flex gap-2">
                                    {['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2'].map(color => (
                                      <button
                                        key={color}
                                        onClick={() => setSelectedStampColor(color)}
                                        style={{ backgroundColor: color }}
                                        className={cn(
                                          "w-5 h-5 rounded-full border-2 transition-all duration-200 cursor-pointer",
                                          selectedStampColor === color ? "border-g-text scale-115 shadow-sm" : "border-transparent"
                                        )}
                                      />
                                    ))}
                                  </div>
                                  
                                  <button
                                    onClick={() => applyEkiStamp(loc.city)}
                                    className="ml-auto py-2 px-4 bg-g-primary-container text-g-primary rounded-xl text-[10px] font-black uppercase tracking-wider hover:brightness-105 active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer relative overflow-hidden"
                                  >
                                    <md-ripple></md-ripple>
                                    <BookOpen size={12} />
                                    <span>Press Seal</span>
                                  </button>
                                </div>

                                {loc.stamp && (
                                  <div className="flex justify-center mt-4 animate-[slideUp_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
                                    <div 
                                      style={{ borderColor: `${loc.stamp.color}aa`, color: loc.stamp.color }}
                                      className="w-20 h-20 rounded-full border-4 border-double flex flex-col items-center justify-center font-display font-black text-[9px] tracking-tight relative rotate-[-5deg] bg-white/20 dark:bg-black/10 select-none shadow-inner"
                                    >
                                      <span className="text-[12px] tracking-widest">{loc.kanji ? loc.kanji.slice(0, 2) : "印"}</span>
                                      <span className="text-[7.5px] font-mono mt-0.5 opacity-90">{loc.stamp.date}</span>
                                      <div className="absolute inset-0 border border-transparent rounded-full select-none pointer-events-none opacity-20 bg-radial-gradient" />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Card deletion utility */}
                              <div className="pt-2 flex justify-end">
                                <button 
                                  onClick={() => handleDelete(loc.city)} 
                                  className="py-2 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer relative overflow-hidden"
                                >
                                  <md-ripple></md-ripple>
                                  <Trash2 size={12} />
                                  <span>Remove Node</span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Standard lower row details when closed */}
                        <div className="flex items-center gap-4 mt-4 pt-1 relative z-10">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-g-aluminium/55 dark:bg-g-aluminium/10 rounded-lg text-[10px] font-bold uppercase text-g-text-variant">
                            <Landmark size={11} /> {loc.category}
                          </div>
                          <div className="text-[11px] font-bold text-g-text tabular-nums font-mono">
                            ¥{loc.budget.toLocaleString()}
                          </div>
                          
                          {/* Schedule badge */}
                          {loc.arrivalDate && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-g-primary">
                              <Clock size={10} />
                              <span>{loc.arrivalTime || "Flexible"}</span>
                            </div>
                          )}

                          {/* Stamp indicator badge */}
                          {loc.stamp && (
                            <div 
                              style={{ color: loc.stamp.color }}
                              className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center font-display text-[6px] font-black rotate-[-12deg]"
                              title="Station Stamp Collected"
                            >
                              印
                            </div>
                          )}

                          <div className={`ml-auto text-[10px] font-bold px-3 py-1 rounded-full flex items-center justify-center transition-colors ${PRIORITY_COLORS[loc.priority] || 'bg-g-aluminium text-g-text-variant'}`}>
                            PRIO {loc.priority}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Railroad connector gap */}
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
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Tab 2: Interactive Timesheet / Travel Schedule */}
          {activeTab === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="space-y-6"
            >
              {/* Daily Schedule Summary Card */}
              <section className="material-card p-6 border-g-outline/10 bg-g-surface shadow-elevation-1 rounded-[32px]">
                <span className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] block mb-3">Timeline Diagnostics</span>
                <h3 className="font-display text-2xl font-black text-g-text leading-none tracking-tight">Travel Timesheet</h3>
                <p className="text-xs text-g-text-variant mt-2 leading-relaxed">
                  Your route modules chronologically organized by date. Tap any slot to refine date, check-in intervals, or track conflicts.
                </p>
              </section>

              {scheduledLocations.length === 0 ? (
                <div className="p-8 text-center bg-g-surface border border-g-outline/10 rounded-[28px] space-y-3">
                  <Clock className="w-10 h-10 text-g-text-variant/40 mx-auto" />
                  <h4 className="font-display font-bold text-g-text text-base">Unscheduled Itinerary</h4>
                  <p className="text-xs text-g-text-variant leading-relaxed">
                    No date blocks assigned yet! Head to your **Destinations** tab, expand a card, and set an arrival date/JST time to compile your timetable.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {scheduledLocations.map((loc, idx) => {
                    const dateHeader = idx === 0 || scheduledLocations[idx - 1].arrivalDate !== loc.arrivalDate;
                    const conflict = hasConflict(loc, idx);
                    
                    return (
                      <div key={loc.city} className="space-y-2 animate-[slideUp_0.4s_cubic-bezier(0.2,0,0,1)]">
                        {dateHeader && (
                          <div className="flex items-center gap-2 mt-4 mb-2">
                            <span className="w-2 h-2 rounded-full bg-g-primary" />
                            <span className="font-display text-sm font-black text-g-text uppercase tracking-widest">{formatDateLabel(loc.arrivalDate)}</span>
                            <span className="flex-1 h-[1px] bg-g-outline/10" />
                          </div>
                        )}

                        <div className={cn(
                          "material-card p-5 border border-g-outline/10 flex items-center gap-4 transition-all hover:border-g-primary/30 rounded-[24px] relative overflow-hidden",
                          conflict ? "border-amber-500/30 bg-amber-500/5" : "bg-g-surface"
                        )}>
                          
                          {/* Hour / Duration slot */}
                          <div className="flex flex-col items-center justify-center pr-3 border-r border-g-outline/10 w-20 shrink-0 text-center relative z-10">
                            <span className="font-mono text-xs font-black text-g-primary">{loc.arrivalTime || "Flexible"}</span>
                            <span className="text-[9px] font-bold text-g-text-variant uppercase tracking-widest mt-1">Arrival</span>
                            
                            {loc.departureTime && (
                              <>
                                <span className="font-mono text-[10px] text-g-text-variant mt-2 leading-none">{loc.departureTime}</span>
                                <span className="text-[8px] font-bold text-g-text-variant uppercase tracking-widest mt-0.5 leading-none">Depart</span>
                              </>
                            )}
                          </div>

                          {/* Destination Card Body */}
                          <div className="flex-1 min-w-0 relative z-10">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[9px] font-bold px-2 py-0.5 bg-g-primary-container text-g-primary rounded-full uppercase tracking-wider">{loc.category}</span>
                              {conflict && (
                                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/20 text-amber-600 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse">
                                  <AlertTriangle size={8} /> Conflict
                                </span>
                              )}
                            </div>
                            
                            <h4 className="text-base font-black text-g-text tracking-tight font-display truncate leading-none mt-1">{loc.city}</h4>
                            <p className="text-[10px] font-medium text-g-text-variant uppercase tracking-wider mt-1.5 truncate">{loc.kanji}</p>
                          </div>

                          {/* Edit shortcut button redirects user back to Tab 1 to expand the editor */}
                          <button
                            onClick={() => {
                              triggerHaptic('medium');
                              setExpandedCard(loc.city);
                              setActiveTab('destinations');
                            }}
                            className="w-10 h-10 rounded-full bg-g-aluminium/40 dark:bg-g-aluminium/5 flex items-center justify-center text-g-text hover:text-g-primary transition-colors shrink-0 relative overflow-hidden"
                            title="Edit schedule details"
                          >
                            <md-ripple></md-ripple>
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Tab 3: GPS Geofence Radar HUD & Simulator Console */}
          {activeTab === 'geofence' && (
            <motion.div
              key="geofence"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="space-y-6"
            >
              {/* Radar Sweep Animated HUD Panel */}
              <section className="material-card p-6 border-g-outline/10 bg-g-surface shadow-elevation-1 rounded-[32px] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-g-primary/5 blur-3xl rounded-full" />
                <span className="text-[10px] font-bold text-g-primary uppercase tracking-[0.2em] block mb-3">Satellite Telemetry Radar</span>
                
                {/* Visual Radial sweep circle */}
                <div className="relative w-44 h-44 mx-auto my-4 bg-g-primary-container/20 rounded-full border border-g-primary/15 flex items-center justify-center overflow-hidden">
                  <div className="absolute w-36 h-36 rounded-full border border-g-primary/10 animate-ping opacity-25" />
                  <div className="absolute w-24 h-24 rounded-full border border-g-primary/20" />
                  <div className="absolute w-10 h-10 rounded-full border border-g-primary/30" />
                  <div className="absolute w-0.5 h-full bg-g-primary/10 animate-[spin_6s_linear_infinite]" />
                  <Activity size={24} className="text-g-primary animate-pulse" />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-g-outline/10">
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block">Active Lat</span>
                    <span className="font-mono text-sm font-black text-g-text">{activeLat.toFixed(6)}</span>
                  </div>
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-g-text-variant uppercase tracking-wider block">Active Lng</span>
                    <span className="font-mono text-sm font-black text-g-text">{activeLng.toFixed(6)}</span>
                  </div>
                </div>
              </section>

              {/* Geofence Simulator / Warp console */}
              <div className="material-card p-6 border border-g-outline/10 bg-g-surface shadow-sm rounded-[28px] space-y-5">
                <div className="flex justify-between items-center border-b border-g-outline/10 pb-3">
                  <div>
                    <h4 className="font-display font-black text-g-text text-base">GPS Test Console</h4>
                    <p className="text-[10px] text-g-text-variant uppercase tracking-wider mt-0.5">Stage & test coordinates offline</p>
                  </div>
                  
                  {/* Authentic Material Web Switch component */}
                  <md-switch
                    selected={isSimulating ? true : undefined}
                    checked={isSimulating}
                    onClick={() => { triggerHaptic('medium'); setIsSimulating(!isSimulating); }}
                    className="cursor-pointer"
                  ></md-switch>
                </div>

                <div className="space-y-4">
                  {/* Warp Dropdown Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-wider block">Simulated Location Warp</label>
                    <div className="relative">
                      <select
                        disabled={!isSimulating}
                        value={locations.findIndex(l => l.lat === simulatedCoords.lat && l.lng === simulatedCoords.lng)}
                        onChange={(e) => {
                          const idx = parseInt(e.target.value);
                          if (idx >= 0 && locations[idx]) {
                            triggerHaptic('heavy');
                            setSimulatedCoords({ lat: locations[idx].lat, lng: locations[idx].lng });
                          }
                        }}
                        className="w-full py-3.5 px-4 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold text-xs focus:outline-none appearance-none disabled:opacity-40"
                      >
                        <option value="-1">-- Teleport to Tokyo Landmarks --</option>
                        {locations.map((loc, i) => (
                          <option key={loc.city} value={i}>{loc.city} ({loc.kanji})</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-g-text-variant">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Geofence Detection Radius slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-g-text-variant uppercase tracking-wider">
                      <span>Geofence Radius Threshold</span>
                      <span className="text-g-primary font-mono font-bold">{geofenceRadius}m</span>
                    </div>
                    <input 
                      type="range"
                      min="50"
                      max="500"
                      step="25"
                      value={geofenceRadius}
                      onChange={(e) => setGeofenceRadius(parseInt(e.target.value))}
                      className="w-full accent-g-primary h-1 bg-g-aluminium dark:bg-g-aluminium/10 rounded-lg cursor-pointer animate-[slideUp_0.5s_ease]"
                    />
                  </div>
                </div>
              </div>

              {/* Nearest Locations Proximity Feed */}
              <div className="space-y-3">
                <span className="font-display text-sm font-black text-g-text uppercase tracking-widest block px-1">Proximity radar feed</span>
                {sortedDistanceLocations.length === 0 ? (
                  <div className="p-5 text-center bg-g-surface border border-g-outline/10 rounded-2xl animate-[slideUp_0.4s_ease]">
                    <CheckCircle2 className="w-8 h-8 text-g-primary mx-auto mb-2" />
                    <span className="text-xs text-g-text-variant font-bold block">All destinations visited! ✈️</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedDistanceLocations.slice(0, 3).map((loc, idx) => {
                      const km = loc.distance / 1000;
                      const displayDist = km < 1 
                        ? `${loc.distance.toFixed(0)} meters` 
                        : `${km.toFixed(2)} km`;
                        
                      return (
                        <div key={loc.city} className="material-card p-4.5 border border-g-outline/10 bg-g-surface rounded-2xl flex items-center justify-between animate-[slideUp_0.35s_cubic-bezier(0.2,0,0,1)]">
                          <div className="min-w-0 pr-3">
                            <span className="font-mono text-[9px] font-bold text-g-primary block mb-0.5">NEAREST NODE 0{idx+1}</span>
                            <h5 className="text-sm font-black font-display text-g-text truncate leading-none">{loc.city}</h5>
                            <span className="text-[10px] font-medium text-g-text-variant uppercase tracking-wider block mt-1.5">{loc.kanji}</span>
                          </div>
                          
                          <div className="shrink-0 text-right font-mono text-[11px] font-black text-g-primary bg-g-primary-container px-3 py-1.5 rounded-xl shadow-inner">
                            {displayDist}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Bottom Navigation Safety Spacer */}
        <div className="h-28 w-full shrink-0"></div>

        {/* Material 3 Bottom Navigation Bar with Authentic Ripple and Springs */}
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-g-surface/85 backdrop-blur-md border-t border-g-outline/10 flex items-center justify-around px-6 z-40 pb-safe shadow-elevation-3 select-none">
          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('destinations'); }}
            className={cn(
              "flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden select-none",
              activeTab === 'destinations' ? "text-g-primary" : "text-g-text-variant hover:text-g-text"
            )}
          >
            <md-ripple></md-ripple>
            <div className={cn(
              "w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              activeTab === 'destinations' ? "bg-g-primary-container text-g-primary scale-105" : "bg-transparent"
            )}>
              <MapPin size={20} className={activeTab === 'destinations' ? "stroke-[2.5]" : "stroke-[1.5]"} />
            </div>
            <span className="text-[9.5px] font-bold tracking-wider uppercase leading-none">Map Nodes</span>
          </button>

          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('schedule'); }}
            className={cn(
              "flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden select-none",
              activeTab === 'schedule' ? "text-g-primary" : "text-g-text-variant hover:text-g-text"
            )}
          >
            <md-ripple></md-ripple>
            <div className={cn(
              "w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              activeTab === 'schedule' ? "bg-g-primary-container text-g-primary scale-105" : "bg-transparent"
            )}>
              <Clock size={20} className={activeTab === 'schedule' ? "stroke-[2.5]" : "stroke-[1.5]"} />
            </div>
            <span className="text-[9.5px] font-bold tracking-wider uppercase leading-none">Calendar</span>
          </button>

          <button 
            onClick={() => { triggerHaptic('light'); setActiveTab('geofence'); }}
            className={cn(
              "flex flex-col items-center gap-1.5 py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer relative overflow-hidden select-none",
              activeTab === 'geofence' ? "text-g-primary" : "text-g-text-variant hover:text-g-text"
            )}
          >
            <md-ripple></md-ripple>
            <div className={cn(
              "w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200",
              activeTab === 'geofence' ? "bg-g-primary-container text-g-primary scale-105" : "bg-transparent"
            )}>
              <Landmark size={20} className={activeTab === 'geofence' ? "stroke-[2.5]" : "stroke-[1.5]"} />
            </div>
            <span className="text-[9.5px] font-bold tracking-wider uppercase leading-none">Radar HUD</span>
          </button>
        </nav>

        {/* geofence automatic Check-in Success Banner notification with Material Spring */}
        <AnimatePresence>
          {showCheckInOverlay && (
            <div className="fixed top-8 left-4 right-4 z-[100] flex justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: -45, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ type: "spring", damping: 20, stiffness: 220 }}
                className="w-full max-w-sm p-4.5 bg-g-primary text-white dark:text-[#202124] rounded-3xl shadow-elevation-3 flex items-center gap-4.5 border border-white/10 dark:border-black/5"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center shrink-0 animate-bounce">
                  <CheckCircle2 size={22} className="text-white dark:text-[#202124]" />
                </div>
                
                <div className="flex-1 min-w-0 text-left">
                  <span className="text-[9px] font-bold text-white/70 dark:text-[#202124]/70 uppercase tracking-[0.25em] block leading-none mb-1">GEOFENCE CHECK-IN</span>
                  <h4 className="text-[15px] font-black font-display tracking-tight leading-none truncate">{showCheckInOverlay.city}</h4>
                  <span className="text-[9.5px] font-bold opacity-80 block mt-1.5 uppercase leading-none">Arrived • Destination logged!</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Location Bottom Sheet with Material Spring */}
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
              
              {/* Premium Frosted Glass Bottom Sheet */}
              <motion.div 
                initial={{ opacity: 0, y: '100%' }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: '100%' }} 
                transition={{ type: "spring", damping: 26, stiffness: 280 }} 
                className="relative w-full max-w-lg bg-white/80 dark:bg-g-surface/80 backdrop-blur-xl border border-g-outline/15 rounded-t-[40px] rounded-b-[24px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
              >
                {/* Header status bar */}
                <div className="w-full flex justify-between items-center border-b border-g-outline/10 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-g-primary animate-pulse" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-g-text-variant uppercase">New Destination</span>
                  </div>
                  <button 
                    onClick={() => { triggerHaptic('light'); setIsAdding(false); }} 
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer relative overflow-hidden"
                  >
                    <md-ripple></md-ripple>
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
                  
                  {/* Coords inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Latitude</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 35.6563"
                        value={newLoc.lat} 
                        onChange={e => setNewLoc({ ...newLoc, lat: e.target.value })} 
                        className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-g-text-variant uppercase tracking-[0.2em] ml-1">Longitude</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 139.6995"
                        value={newLoc.lng} 
                        onChange={e => setNewLoc({ ...newLoc, lng: e.target.value })} 
                        className="w-full py-4 px-5 bg-g-aluminium/20 dark:bg-g-aluminium/5 border border-g-outline/15 rounded-xl text-g-text font-bold focus:outline-none focus:border-g-primary transition-colors" 
                      />
                    </div>
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
                    className="w-full h-16 bg-g-primary text-white dark:text-[#202124] font-display font-black text-sm tracking-widest uppercase rounded-2xl shadow-elevation-2 hover:brightness-110 active:scale-95 transition-all duration-200 ripple flex items-center justify-center cursor-pointer relative overflow-hidden"
                  >
                    <md-ripple></md-ripple>
                    Commit Node
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Modal with Material Spring */}
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
                transition={{ type: "spring", damping: 26, stiffness: 280 }}
                className="relative w-full max-w-lg bg-white/80 dark:bg-g-surface/80 backdrop-blur-xl border border-g-outline/15 rounded-t-[40px] rounded-b-[24px] p-6 md:p-8 shadow-2xl flex flex-col space-y-6 z-10 max-h-[85vh] overflow-y-auto no-scrollbar transition-colors duration-700"
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-g-aluminium dark:bg-g-aluminium/10 text-g-text hover:bg-g-primary-container hover:text-g-primary transition-colors cursor-pointer relative overflow-hidden"
                  >
                    <md-ripple></md-ripple>
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
                  className="w-full py-4 bg-g-primary text-white dark:text-[#202124] font-bold rounded-2xl shadow-elevation-2 hover:bg-g-primary/95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ripple mt-4 cursor-pointer relative overflow-hidden"
                >
                  <md-ripple></md-ripple>
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
