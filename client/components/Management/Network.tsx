import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Radar, Activity, TrafficCone, AlertTriangle, ShieldCheck, Zap, Globe, MapPin, Search } from 'lucide-react';

interface NetworkNode {
  id: string;
  name: string;
  supermarket: string;
  status: 'OPTIMAL' | 'BUSY' | 'KILLED';
  x: number;
  y: number;
}

interface NetworkAlert {
  action: string;
  severity: string;
  created_at: string;
}

interface NetworkHealth {
  latency: string;
  congestion: string;
  firewall: string;
  flux: string;
}

const Network: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [health, setHealth] = useState<NetworkHealth | null>(null);
  const [alerts, setAlerts] = useState<NetworkAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get('/api/network/telemetry', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNodes(response.data.data.nodes);
        setHealth(response.data.data.health);
        setAlerts(response.data.data.alerts);
      }
    } catch (error) {
      console.error('Error fetching telemetry:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Generate sparse logical connections between nodes
  const connections = nodes.slice(0, 15).map((node, i) => {
    const nextNode = nodes[(i + 1) % nodes.length];
    return { from: node.id, to: nextNode.id };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen -mt-20">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-2 border-emerald-500/10 rounded-full"></div>
            <div className="absolute inset-0 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
            <Radar className="absolute inset-0 m-auto text-emerald-500/40 animate-pulse" size={32} />
          </div>
          <div className="text-center">
            <p className={`text-[10px] font-black uppercase tracking-[0.6em] ${isDark ? 'text-white' : 'text-gray-950'}`}>Synchronizing Pulse</p>
            <p className={`text-[8px] font-bold uppercase tracking-[0.4em] mt-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Map projection in progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Network Pulse</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Spatial Telemetry // Real-time Operational Flux</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-3 glass-card flex items-center gap-4 border-white/5 ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-emerald-50 text-emerald-700 shadow-lg'}`}>
            <Activity size={16} className="animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">Global Sync Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* SVG Map Container - NOW FULL WIDTH */}
        <div className={`col-span-12 glass-card aspect-[21/9] relative overflow-hidden flex flex-col ${isDark ? 'bg-[#010412]/60 border-white/5 shadow-[inset_0_0_150px_rgba(16,185,129,0.05)]' : 'bg-gray-50 border-black/5'}`}>

          {/* Map Header */}
          <div className="p-8 flex justify-between items-center relative z-20">
            <div className="flex items-center gap-4">
              <Radar size={18} className="text-emerald-500 animate-spin-slow" />
              <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Addis Ababa Region // Cluster Node 88</span>
            </div>
            <div className="flex gap-2">
              <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/30 hover:text-white' : 'bg-white text-gray-400 shadow-md'}`}><Search size={16} /></button>
              <button className={`p-2 rounded-xl transition-all ${isDark ? 'bg-white/5 text-white/30 hover:text-white' : 'bg-white text-gray-400 shadow-md'}`}><Globe size={16} /></button>
            </div>
          </div>

          <div className="flex-1 relative">
            <svg viewBox="0 0 1000 600" className="w-full h-full">
              {/* TECHNICAL GRID BACKGROUND */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDark ? "rgba(16, 185, 129, 0.03)" : "rgba(0,0,0,0.02)"} strokeWidth="1" />
                </pattern>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* RADAR RINGS */}
              <circle cx="500" cy="300" r="120" fill="none" stroke={isDark ? "rgba(16, 185, 129, 0.05)" : "rgba(0,0,0,0.02)"} strokeWidth="1" strokeDasharray="5 5" />
              <circle cx="500" cy="300" r="240" fill="none" stroke={isDark ? "rgba(16, 185, 129, 0.05)" : "rgba(0,0,0,0.02)"} strokeWidth="1" strokeDasharray="5 5" />

              <line x1="500" y1="300" x2="1000" y2="300" stroke="rgba(16, 185, 129, 0.04)" strokeWidth="1" strokeLinecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 500 300" to="360 500 300" dur="15s" repeatCount="indefinite" />
              </line>

              {/* Connection Lines (Power Lines) - REDUCED DENSITY */}
              {connections.filter((_, idx) => idx % 2 === 0).map((c, i) => {
                const start = nodes.find(h => h.id === c.from);
                const end = nodes.find(h => h.id === c.to);
                if (!start || !end) return null;
                const isKilled = start.status === 'KILLED' || end.status === 'KILLED';

                return (
                  <g key={i}>
                    <path
                      d={`M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${start.y - 80}, ${(start.x + end.x) / 2} ${end.y + 80}, ${end.x} ${end.y}`}
                      fill="none"
                      stroke={isKilled ? "rgba(244, 63, 94, 0.08)" : "rgba(16, 185, 129, 0.12)"}
                      strokeWidth="1.5"
                    />
                    {!isKilled && (
                      <circle r="2" fill="#10b981" filter="url(#glow)">
                        <animateMotion
                          dur={`${5 + Math.random() * 5}s`}
                          repeatCount="indefinite"
                          path={`M ${start.x} ${start.y} C ${(start.x + end.x) / 2} ${start.y - 80}, ${(start.x + end.x) / 2} ${end.y + 80}, ${end.x} ${end.y}`}
                        />
                      </circle>
                    )}
                  </g>
                );
              })}

              {/* Hub Nodes */}
              {nodes.map((hub) => (
                <g
                  key={hub.id}
                  onMouseEnter={() => setHoveredNode(hub.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                >
                  {/* Outer Glow */}
                  <circle
                    cx={hub.x} cy={hub.y} r="35"
                    fill={hub.status === 'KILLED' ? '#f43f5e' : hub.status === 'BUSY' ? '#f59e0b' : '#10b981'}
                    fillOpacity={hoveredNode === hub.id ? "0.15" : "0.05"}
                    className="transition-all duration-500"
                  />
                  {hub.status !== 'KILLED' && (
                    <circle cx={hub.x} cy={hub.y} r="45" fill="none" stroke={hub.status === 'BUSY' ? '#f59e0b' : '#10b981'} strokeOpacity="0.05" strokeWidth="1">
                      <animate attributeName="r" from="35" to="65" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" from="0.5" to="0" dur="4s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {/* Core Node */}
                  <g>
                    <circle
                      cx={hub.x} cy={hub.y} r="8"
                      fill={hub.status === 'KILLED' ? '#f43f5e' : hub.status === 'BUSY' ? '#f59e0b' : '#10b981'}
                      className={hub.status === 'BUSY' ? 'animate-pulse' : ''}
                      filter="url(#glow)"
                    />
                    <circle cx={hub.x} cy={hub.y} r="12" fill="none" stroke={hub.status === 'KILLED' ? '#f43f5e' : hub.status === 'BUSY' ? '#f59e0b' : '#10b981'} strokeWidth="1" strokeOpacity="0.4" />
                  </g>

                  {/* INTERACTIVE DATA TAG LABEL - ONLY ON HOVER */}
                  {hoveredNode === hub.id && (
                    <g transform={`translate(${hub.x}, ${hub.y + 35})`} className="animate-in fade-in zoom-in-95 duration-300">
                      <rect
                        x="-60" y="-12" width="120" height="24" rx="12"
                        fill={isDark ? "rgba(16, 185, 129, 0.95)" : "rgba(16, 185, 129, 0.9)"}
                        className="shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                      />
                      <text
                        textAnchor="middle" y="5"
                        className="text-[10px] font-black uppercase tracking-[0.2em] fill-white"
                      >
                        {hub.name.length > 18 ? hub.name.substring(0, 15) + '...' : hub.name}
                      </text>
                    </g>
                  )}
                </g>
              ))}
            </svg>

            {/* FLOATING HEALTH STATS OVERLAY */}
            <div className="absolute top-8 left-8 space-y-3 z-30 hidden md:block">
              <div className={`p-4 rounded-2xl border backdrop-blur-xl ${isDark ? 'bg-black/40 border-white/10' : 'bg-white/60 border-black/5'}`}>
                <div className="flex items-center gap-8">
                  <HealthStat icon={<Activity size={14} className="text-emerald-500" />} label="LAT" value={health?.latency || '...'} isDark={isDark} />
                  <div className="w-px h-6 bg-white/10"></div>
                  <HealthStat icon={<TrafficCone size={14} className="text-amber-500" />} label="SYNC" value={health?.congestion || '...'} isDark={isDark} />
                  <div className="w-px h-6 bg-white/10"></div>
                  <HealthStat icon={<ShieldCheck size={14} className="text-blue-500" />} label="SEC" value={health?.firewall || '...'} isDark={isDark} />
                </div>
              </div>
            </div>
          </div>

          {/* Map Footer Info */}
          <div className={`p-8 border-t flex items-center justify-between ${isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-white/20'}`}>
            <div className="flex gap-8">
              <MapLegend label="Operational Hub" color="#10b981" isDark={isDark} />
              <MapLegend label="Throttled Node" color="#f59e0b" isDark={isDark} />
              <MapLegend label="Revoked Access" color="#f43f5e" isDark={isDark} />
            </div>
            <div className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
              Flux Capacity: {health?.flux || '...'}
            </div>
          </div>
        </div>

        {/* ALERTS SECTION - NOW HORIZONTAL BELOW MAP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {alerts.map((alert, i) => (
            <div key={i} className={`p-6 rounded-[2rem] border overflow-hidden relative transition-all hover:scale-[1.02] ${isDark ? 'bg-rose-500/[0.03] border-rose-500/10' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex gap-4 items-start">
                <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={18} />
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-900'}`}>{alert.action}</p>
                  <p className={`text-[9px] font-medium leading-relaxed mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    Level: {alert.severity.toUpperCase()} // Time: {new Date(alert.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <div className={`col-span-3 p-10 rounded-[2.5rem] border border-dashed text-center ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-gray-50'}`}>
              <p className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/10' : 'text-gray-300'}`}>No System Alerts Detected // All Protocols Nominal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MapLegend = ({ label, color, isDark }: any) => (
  <div className="flex items-center gap-2">
    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
    <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const HealthStat = ({ icon, label, value, isDark }: any) => (
  <div className="flex justify-between items-center">
    <div className="flex items-center gap-3">
      {icon}
      <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{label}</span>
    </div>
    <span className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-950'}`}>{value}</span>
  </div>
);

export default Network;

