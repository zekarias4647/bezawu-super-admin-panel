import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, ComposedChart, Line
} from 'recharts';
import {
  Activity, Database, Layers, ArrowUpRight, Shield,
  TrendingUp, Wallet, Users, Zap, Clock, Globe, BarChart3,
  Target, Rocket, CreditCard, ChevronDown, Calendar, Info,
  Cpu, Award, Fingerprint, Search, Sparkles, Box, ShoppingBag,
  MapPin, UserCheck
} from 'lucide-react';

interface DashboardProps {
  theme?: 'light' | 'dark';
}

interface Stats {
  totalRevenue: string;
  platformCommission: string;
  totalUsers: number;
  totalBranches: number;
  recentRevenue: string;
  revenueGrowth: string;
  commissionGrowth: string;
  userGrowth: string;
}

interface ChartDataItem {
  month: string;
  revenue: string;
  expected: string;
  commission: string;
  orders: number;
}

interface SupermarketData {
  name: string;
  revenue: string;
  branches: number;
  growth: string;
  impact: number;
  orders: number;
  color: string;
}

interface ProductData {
  name: string;
  value: string;
  sales: string;
  productCount: number;
  color: string;
}


const Dashboard: React.FC<DashboardProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [topSupermarkets, setTopSupermarkets] = useState<SupermarketData[]>([]);
  const [topProducts, setTopProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };

        const baseUrl = 'http://superadminapi.ristestate.com/api/dashboard';

        const [statsRes, chartRes, supermarketsRes, productsRes] = await Promise.all([
          axios.get(`${baseUrl}/stats`, config),
          axios.get(`${baseUrl}/revenue-chart`, config),
          axios.get(`${baseUrl}/top-supermarkets`, config),
          axios.get(`${baseUrl}/top-products`, config)
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (chartRes.data.success) setChartData(chartRes.data.data);
        if (supermarketsRes.data.success) setTopSupermarkets(supermarketsRes.data.data);
        if (productsRes.data.success) setTopProducts(productsRes.data.data);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Synchronizing Hub Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 pb-20">
      {/* Fiscal Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-1 w-10 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]"></div>
            <p className={`text-[9px] font-black uppercase tracking-[0.4em] transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Protocol Audit Node // Bezaw v8.2</p>
          </div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>Revenue Hub</h1>
          <p className={`text-xs font-medium mt-1 transition-colors ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Fiscal auditing of institutional yields and global product dominance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`glass-card px-5 py-2.5 rounded-xl flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg transition-all ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-white border-black/10 text-gray-900'}`}>
            <Calendar size={12} className="text-emerald-500" />
            Monthly Audit Stream
          </div>
          <button className={`glass-card px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all group relative overflow-hidden ${isDark ? 'bg-white/5 border-white/10 text-white/40 hover:text-white' : 'bg-gray-950 text-white hover:bg-black shadow-lg'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            Generate Ledger <ChevronDown size={12} className="inline ml-2 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Primary KPI Stream */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Revenue"
          value={`ETB ${parseFloat(stats?.totalRevenue || '0') >= 1000000 ? (parseFloat(stats?.totalRevenue || '0') / 1000000).toFixed(2) + 'M' : (parseFloat(stats?.totalRevenue || '0') / 1000).toFixed(1) + 'K'}`}
          change={stats?.revenueGrowth || '0%'}
          isPositive={true}
          icon={<Wallet className={isDark ? "text-emerald-400" : "text-gray-950"} />}
          accent={isDark ? "bg-emerald-500/10" : "bg-gray-100"}
          isDark={isDark}
          subtext="Aggregate System Intake"
        />
        <StatCard
          title="Platform Capture"
          value={`ETB ${parseFloat(stats?.platformCommission || '0') >= 1000000 ? (parseFloat(stats?.platformCommission || '0') / 1000000).toFixed(2) + 'M' : (parseFloat(stats?.platformCommission || '0') / 1000).toFixed(1) + 'K'}`}
          change={stats?.commissionGrowth || '0%'}
          isPositive={true}
          icon={<Award className={isDark ? "text-blue-400" : "text-gray-950"} />}
          accent={isDark ? "bg-blue-500/10" : "bg-gray-100"}
          isDark={isDark}
          subtext="Net Service Yield (5%)"
        />
        <StatCard
          title="App User Count"
          value={`${(stats?.totalUsers || 0) >= 1000 ? ((stats?.totalUsers || 0) / 1000).toFixed(1) + 'K' : stats?.totalUsers || 0}`}
          change={stats?.userGrowth || '0%'}
          isPositive={true}
          icon={<UserCheck className={isDark ? "text-purple-400" : "text-gray-950"} />}
          accent={isDark ? "bg-purple-500/10" : "bg-gray-100"}
          isDark={isDark}
          subtext="Active Platform Users"
        />
        <StatCard
          title="Branch Count"
          value={`${stats?.totalBranches || 0} Active`}
          change="Optimal"
          isPositive={true}
          icon={<MapPin className={isDark ? "text-amber-400" : "text-gray-950"} />}
          accent={isDark ? "bg-amber-500/10" : "bg-gray-100"}
          isDark={isDark}
          subtext="Total Deployment Nodes"
        />
      </div>

      {/* Core Analytical Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Revenue Throughput (Monthly View) */}
        <div className={`lg:col-span-2 glass-card p-10 shadow-2xl relative overflow-hidden transition-all ${isDark ? 'border-white/5' : 'border-black/10 bg-white'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative z-10">
            <div>
              <h3 className={`text-xl font-black font-poppins tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>Fiscal Throughput</h3>
              <p className={`text-[8px] font-bold uppercase tracking-[0.4em] mt-1 transition-colors ${isDark ? 'text-white/20' : 'text-gray-500'}`}>Monthly Revenue Performance vs Forecast</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-100 text-gray-900'}`}>
              <Globe size={10} className="animate-spin-slow" /> Global Ledger
            </div>
          </div>

          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 800 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.4)', fontSize: 9, fontWeight: 800 }} dx={-5} />
                <Tooltip
                  cursor={{ stroke: '#10b981', strokeWidth: 1.5 }}
                  contentStyle={{
                    background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '1rem',
                    border: 'none',
                    boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.2)',
                    padding: '1rem'
                  }}
                />
                <Area type="monotone" dataKey="revenue" fill="url(#revenueGradient)" stroke="#10b981" strokeWidth={4} />
                <Line type="monotone" dataKey="expected" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 6" dot={{ r: 3, fill: '#3b82f6' }} />
                <Bar dataKey="commission" barSize={12} fill="#a855f7" radius={[3, 3, 0, 0]} fillOpacity={0.5} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex flex-wrap gap-8 items-center justify-center relative z-10 border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Actual Yield</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>System Target</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Tax (5%)</span>
            </div>
          </div>
        </div>

        {/* Product Dominance Pie Chart */}
        <div className={`glass-card p-10 shadow-2xl flex flex-col transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/10'}`}>
          <div className="flex justify-between items-center mb-8">
            <h3 className={`text-xl font-black font-poppins tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>Product Core</h3>
            <Box size={16} className="text-white/20" />
          </div>

          <div className="h-64 w-full relative mb-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-3xl font-black transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>
                {topProducts.reduce((sum, p) => sum + parseInt(p.value), 0)}%
              </span>
              <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Market Weight</span>
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {topProducts.map((d, i) => (
              <div key={i} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className={`text-[9px] font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/60 group-hover:text-white' : 'text-gray-600 group-hover:text-gray-950'}`}>{d.name}</span>
                </div>
                <span className={`text-[10px] font-black transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>{d.value}%</span>
              </div>
            ))}
          </div>

          <div className={`mt-8 p-4 rounded-2xl border transition-all ${isDark ? 'bg-purple-500/5 border-purple-500/10' : 'bg-purple-50 border-purple-100'}`}>
            <p className={`text-[8px] font-bold leading-relaxed uppercase tracking-tight transition-colors ${isDark ? 'text-purple-400/60' : 'text-purple-700'}`}>
              <TrendingUp size={9} className="inline mr-1 mb-0.5" /> Organic Dairy maintains peak dominance.
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard and Network Flux Mapping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* High Performance Revenue Leaderboard */}
        <div className={`glass-card p-10 shadow-2xl transition-all flex flex-col ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/10'}`}>
          <div className="flex justify-between items-center mb-10">
            <h3 className={`text-xl font-black font-poppins tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>Entity Rankings</h3>
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-100 text-gray-950'}`}>
              <BarChart3 size={16} />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            {topSupermarkets.map((inst, idx) => (
              <div key={idx} className={`flex items-center justify-between p-5 rounded-[2rem] border transition-all hover:translate-x-2 group ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/5' : 'bg-gray-50 border-black/5 hover:bg-gray-100 shadow-sm'}`}>
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs relative overflow-hidden ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-gray-950 text-white'}`}>
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent"></div>
                    #{idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{inst.name}</p>
                    <p className={`text-[8px] font-bold uppercase tracking-[0.15em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{inst.branches} Cluster Nodes</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-base font-black transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>ETB {parseFloat(inst.revenue) >= 1000 ? (parseFloat(inst.revenue) / 1000).toFixed(1) + 'K' : parseFloat(inst.revenue).toFixed(0)}</p>
                  <div className={`flex items-center justify-end gap-1.5 text-[9px] font-black uppercase tracking-widest ${inst.growth.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <TrendingUp size={10} strokeWidth={3} className={inst.growth.startsWith('+') ? '' : 'rotate-180'} />
                    {inst.growth}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className={`mt-8 w-full py-4 glass-card text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 ${isDark ? 'bg-white/5 border-white/5 text-white/30 hover:text-white' : 'bg-gray-950 text-white shadow-lg'}`}>
            Full Fiscal Analytics <ArrowUpRight size={12} />
          </button>
        </div>

        {/* SOMETHING COOL: Network Velocity Pulse */}
        <div className={`glass-card p-10 shadow-2xl transition-all relative overflow-hidden ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/10'}`}>
          <div className="absolute -right-24 -top-24 w-72 h-72 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className={`text-xl font-black font-poppins tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>Network Velocity</h3>
              <p className={`text-[8px] font-bold uppercase tracking-[0.4em] mt-1 transition-colors ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Real-time Institutional Flux mapping</p>
            </div>
            <Sparkles size={20} className="text-emerald-500 animate-pulse" />
          </div>

          <div className="space-y-6 relative z-10">
            {topSupermarkets.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="flex justify-between items-end mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-[9px] font-black" style={{ backgroundColor: `${item.color}15`, color: item.color, border: `1px solid ${item.color}20` }}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-gray-950'}`}>{item.name}</span>
                      <span className={`text-[7px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-white/10' : 'text-gray-400'}`}>Node Sync Active</span>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black block ${isDark ? 'text-white' : 'text-gray-950'}`}>{item.impact}% Impact</span>
                </div>
                <div className={`h-2 w-full rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden relative`}>
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.impact}%`,
                      backgroundColor: item.color,
                      boxShadow: isDark ? `0 0 12px ${item.color}60` : 'none'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-10 p-5 rounded-[1.5rem] border flex items-center gap-4 transition-all ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Rocket size={18} className="animate-bounce" />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>Growth Flux Active</p>
              <p className={`text-[8px] font-medium leading-relaxed transition-colors ${isDark ? 'text-white/30' : 'text-gray-500'}`}>
                Aggregate institutional impact is trending 12.4% above benchmark. Network consensus verified.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
  accent: string;
  isDark: boolean;
  subtext: string;
}> = ({ title, value, change, isPositive, icon, accent, isDark, subtext }) => (
  <div className={`glass-card p-8 transition-all shadow-xl hover:translate-y-[-6px] relative overflow-hidden group ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/[0.08]' : 'bg-white border-black/10 backdrop-blur-3xl'}`}>
    <div className={`absolute top-0 right-0 w-24 h-24 transition-all duration-1000 opacity-[0.02] group-hover:opacity-[0.06] group-hover:scale-125 rotate-12 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      {icon}
    </div>

    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl border transition-all ${accent} ${isDark ? 'border-white/5' : 'border-black/5'}`}>
        {icon}
      </div>
      <div className={`flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-[0.1em] transition-colors ${isPositive ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-rose-500'}`}>
        <span>{change}</span>
        {isPositive ? <ArrowUpRight size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} className="rotate-180" />}
      </div>
    </div>

    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1.5 transition-colors ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{title}</p>
    <p className={`text-2xl font-black font-poppins tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-gray-950'}`}>{value}</p>
    <div className="flex items-center gap-2.5 mt-4">
      <div className={`h-0.5 w-5 rounded-full ${isDark ? 'bg-emerald-500/20' : 'bg-gray-100'}`}>
        <div className={`h-full w-2/3 bg-emerald-500 rounded-full`}></div>
      </div>
      <p className={`text-[8px] font-bold uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/10' : 'text-gray-300'}`}>{subtext}</p>
    </div>
  </div>
);

export default Dashboard;
