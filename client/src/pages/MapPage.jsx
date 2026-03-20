import React, { useState, useEffect, useCallback } from 'react';
import { centerAPI } from '../api';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import toast from 'react-hot-toast';
import { MapPin, Star, Clock, Phone, Search, Filter, ExternalLink } from 'lucide-react';

// Color palette for center pins
const PIN_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function MapPage() {
  const [centers, setCenters]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedCenter, setSelected] = useState(null);
  const [searchCity, setSearchCity]   = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchCenters = useCallback(async (city = '') => {
    setLoading(true);
    try {
      const res = await centerAPI.getCenters(city);
      setCenters(res.data.centers || []);
    } catch {
      toast.error('Failed to load centers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCenters(); }, [fetchCenters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchCity(searchInput.trim());
    fetchCenters(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchCity('');
    fetchCenters('');
  };

  // Build a simple SVG map from lat/lng coordinates
  // Map coordinates to SVG viewBox (normalize to 800x500)
  const mapCenters = centers.filter((c) => c.coordinates?.lat && c.coordinates?.lng);

  const minLat = mapCenters.length ? Math.min(...mapCenters.map((c) => c.coordinates.lat)) - 0.3 : 8;
  const maxLat = mapCenters.length ? Math.max(...mapCenters.map((c) => c.coordinates.lat)) + 0.3 : 30;
  const minLng = mapCenters.length ? Math.min(...mapCenters.map((c) => c.coordinates.lng)) - 0.3 : 68;
  const maxLng = mapCenters.length ? Math.max(...mapCenters.map((c) => c.coordinates.lng)) + 0.3 : 90;

  const toSVG = (lat, lng) => ({
    x: Math.round(((lng - minLng) / (maxLng - minLng)) * 760 + 20),
    y: Math.round(((maxLat - lat) / (maxLat - minLat)) * 460 + 20),
  });

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="page-title">Recycling Centers Map</h1>
          <p className="page-subtitle">Find certified e-waste drop-off centers near you</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by city (e.g. Mumbai, Delhi...)"
              className="input pl-9"
            />
          </div>
          <button type="submit" className="btn-primary flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
          {searchCity && (
            <button type="button" onClick={handleClearSearch} className="btn-secondary">
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* SVG Map */}
            <div className="lg:col-span-2">
              <div className="card overflow-hidden">
                <div className="px-4 pt-4 pb-2 border-b border-slate-700 flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">
                    {searchCity ? `Centers in "${searchCity}"` : 'All Centers'} — {centers.length} found
                  </span>
                  <span className="text-slate-400 text-xs">Click a pin to view details</span>
                </div>

                {/* Interactive SVG Map */}
                <div className="relative bg-slate-900 overflow-hidden" style={{ height: '460px' }}>
                  {/* Grid lines background */}
                  <svg
                    viewBox="0 0 800 500"
                    className="w-full h-full"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
                  >
                    {/* Grid */}
                    {Array.from({ length: 10 }).map((_, i) => (
                      <g key={i}>
                        <line x1={i * 80} y1={0} x2={i * 80} y2={500} stroke="#1e293b" strokeWidth={1} />
                        <line x1={0} y1={i * 50} x2={800} y2={i * 50} stroke="#1e293b" strokeWidth={1} />
                      </g>
                    ))}

                    {/* "Roads" decorative */}
                    <line x1={50} y1={250} x2={750} y2={240} stroke="#334155" strokeWidth={4} strokeDasharray="20,8" opacity={0.5} />
                    <line x1={200} y1={50} x2={180} y2={460} stroke="#334155" strokeWidth={3} strokeDasharray="15,6" opacity={0.4} />
                    <line x1={500} y1={80} x2={520} y2={450} stroke="#334155" strokeWidth={3} strokeDasharray="15,6" opacity={0.4} />

                    {/* Center pins */}
                    {mapCenters.map((center, idx) => {
                      const { x, y } = toSVG(center.coordinates.lat, center.coordinates.lng);
                      const color = PIN_COLORS[idx % PIN_COLORS.length];
                      const isSelected = selectedCenter?._id === center._id;
                      return (
                        <g
                          key={center._id}
                          onClick={() => setSelected(isSelected ? null : center)}
                          className="cursor-pointer"
                          style={{ transition: 'transform 0.2s' }}
                        >
                          {/* Pulse ring for selected */}
                          {isSelected && (
                            <circle cx={x} cy={y} r={22} fill={color} opacity={0.2}>
                              <animate attributeName="r" values="18;28;18" dur="1.5s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.3;0;0.3" dur="1.5s" repeatCount="indefinite" />
                            </circle>
                          )}
                          {/* Pin shadow */}
                          <ellipse cx={x} cy={y + 16} rx={6} ry={2} fill="#000" opacity={0.3} />
                          {/* Pin body */}
                          <path
                            d={`M${x},${y - 18} C${x - 10},${y - 18} ${x - 14},${y - 8} ${x - 14},${y - 2} C${x - 14},${y + 6} ${x},${y + 16} ${x},${y + 16} C${x},${y + 16} ${x + 14},${y + 6} ${x + 14},${y - 2} C${x + 14},${y - 8} ${x + 10},${y - 18} ${x},${y - 18} Z`}
                            fill={isSelected ? color : color + 'cc'}
                            stroke={isSelected ? '#fff' : color}
                            strokeWidth={isSelected ? 2 : 1}
                          />
                          {/* Pin icon */}
                          <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={10} fill="white" fontWeight="bold">♻</text>
                          {/* Label */}
                          <text x={x} y={y + 24} textAnchor="middle" fontSize={9} fill="#94a3b8" className="select-none">
                            {center.name.split(' ')[0]}
                          </text>
                        </g>
                      );
                    })}

                    {/* No centers message */}
                    {mapCenters.length === 0 && (
                      <text x={400} y={250} textAnchor="middle" fill="#475569" fontSize={16}>
                        No centers found. Try a different city.
                      </text>
                    )}
                  </svg>

                  {/* Map overlay — selected center info */}
                  {selectedCenter && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-800/95 border border-slate-600 rounded-xl p-4 backdrop-blur-sm shadow-xl">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{selectedCenter.name}</div>
                          <div className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                            <MapPin size={11} /> {selectedCenter.address}, {selectedCenter.city}
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Star size={11} fill="currentColor" /> {selectedCenter.rating}
                            </span>
                            <span className="flex items-center gap-1 text-slate-400 text-xs">
                              <Clock size={11} /> {selectedCenter.hours}
                            </span>
                            {selectedCenter.phone && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs">
                                <Phone size={11} /> {selectedCenter.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCenter.accepts?.slice(0, 4).map((a) => (
                              <span key={a} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{a}</span>
                            ))}
                            {selectedCenter.accepts?.length > 4 && (
                              <span className="text-xs text-slate-500">+{selectedCenter.accepts.length - 4} more</span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white p-1">✕</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Centers List */}
            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                {centers.length} center{centers.length !== 1 ? 's' : ''} found
              </p>
              {centers.length === 0 ? (
                <div className="card p-6">
                  <EmptyState icon="🏭" title="No centers found" description="Try searching for a different city." />
                </div>
              ) : (
                centers.map((center, idx) => {
                  const color = PIN_COLORS[idx % PIN_COLORS.length];
                  const isSelected = selectedCenter?._id === center._id;
                  return (
                    <div
                      key={center._id}
                      onClick={() => setSelected(isSelected ? null : center)}
                      className={`card p-4 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'border-green-500/50 bg-green-500/5 shadow-lg shadow-green-500/10'
                          : 'hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Color dot */}
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white text-sm leading-tight">{center.name}</div>
                          <div className="text-slate-400 text-xs mt-0.5">{center.city}</div>

                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Star size={10} fill="currentColor" /> {center.rating}
                            </span>
                            <span className="text-slate-500 text-xs flex items-center gap-1">
                              <Clock size={10} /> {center.hours}
                            </span>
                          </div>

                          {isSelected && (
                            <div className="mt-2">
                              <div className="text-slate-500 text-xs mb-1.5 flex items-center gap-1">
                                <MapPin size={10} /> {center.address}
                              </div>
                              {center.phone && (
                                <div className="text-slate-500 text-xs mb-2 flex items-center gap-1">
                                  <Phone size={10} /> {center.phone}
                                </div>
                              )}
                              <div className="flex flex-wrap gap-1">
                                {center.accepts?.map((a) => (
                                  <span key={a} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{a}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="card p-4 mt-6">
          <p className="text-slate-400 text-xs font-medium mb-2">ℹ️ About this map</p>
          <p className="text-slate-500 text-xs">
            This map displays certified e-waste recycling centers seeded from our database.
            Coordinates are real GPS locations. In production, this integrates with Google Maps API for
            routing, directions, and live capacity data. Click any pin or card to see center details.
          </p>
        </div>
      </div>
    </div>
  );
}
