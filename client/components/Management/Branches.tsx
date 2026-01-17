import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  MapPin, Phone, Mail, User, Box, ShieldCheck,
  Search, Filter, Eye, X, ExternalLink,
  Activity, Tag, DollarSign, Package, UserCheck, AlertCircle,
  TrendingUp, Users, Wallet, Layers, Radar, Database,
  Zap, Power, ShieldAlert, Lock, Unlock, Globe, ChevronRight,
  Shield, TrafficCone, AlertTriangle
} from 'lucide-react';

interface BranchesProps {
  theme?: 'light' | 'dark';
}

interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'BRANCH_MANAGER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  sku: string;
  image_url: string;
  category: string;
}

interface Branch {
  id: string;
  supermarket_id: string;
  supermarket_name: string;
  name: string;
  address: string;
  map_pin: string;
  phone: string;
  is_busy: boolean;
  status: string;
  manager: Manager | null;
  products: Product[];
  total_revenue: number;
  total_customers: number;
  product_count: number;
}

// No mock data needed, fetching from API

const Branches: React.FC<BranchesProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('http://superadminapi.ristestate.com/api/branches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranchProducts = async (branchId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://superadminapi.ristestate.com/api/branches/${branchId}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBranches(prev => prev.map(b =>
          b.id === branchId ? { ...b, products: response.data.data } : b
        ));
        if (selectedBranch?.id === branchId) {
          setSelectedBranch(prev => prev ? { ...prev, products: response.data.data } : null);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const closeModal = () => setSelectedBranch(null);

  const toggleBusyMode = async (id: string, currentBusy: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`http://superadminapi.ristestate.com/api/branches/${id}/busy`,
        { is_busy: !currentBusy },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBranches(prev => prev.map(b => b.id === id ? { ...b, is_busy: !currentBusy } : b));
        if (selectedBranch?.id === id) {
          setSelectedBranch(prev => prev ? { ...prev, is_busy: !currentBusy } : null);
        }
      }
    } catch (error) {
      console.error('Error toggling busy mode:', error);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus.toUpperCase() === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`http://superadminapi.ristestate.com/api/branches/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBranches(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
        if (selectedBranch?.id === id) {
          setSelectedBranch(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    fetchBranchProducts(branch.id);
  };

  const filteredBranches = branches.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.supermarket_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Decrypting Cluster Nodes...</p>
        </div>
      </div>
    );
  }

  const modalContent = selectedBranch ? (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-1000 backdrop-blur-[120px] ${isDark ? 'bg-slate-950/40' : 'bg-white/30'}`}
        onClick={closeModal}
      ></div>

      <div className={`relative w-full max-w-7xl glass-card overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.5)] border transition-all duration-500 flex flex-col max-h-[96vh] ${isDark ? 'bg-[#020617]/60 border-white/10' : 'bg-white/60 border-black/5'}`}>

        {/* Modal Header */}
        <div className={`p-8 border-b flex flex-col md:flex-row justify-between items-center gap-6 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-gray-50/10'}`}>
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl relative group ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white text-emerald-600'}`}>
              <MapPin size={32} />
              {selectedBranch.is_busy && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-pulse border-4 border-black/50"></div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className={`text-3xl font-black font-poppins tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedBranch.name}</h2>
                <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedBranch.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                  {selectedBranch.status}
                </div>
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{selectedBranch.supermarket_name} // Node Cluster</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`px-5 py-3 rounded-2xl border flex items-center gap-4 transition-all ${selectedBranch.is_busy ? 'bg-amber-500/10 border-amber-500/30' : 'bg-white/5 border-white/5'}`}>
              <div className="flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest ${selectedBranch.is_busy ? 'text-amber-400' : 'text-white/20'}`}>Traffic Control</span>
                <span className={`text-[10px] font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedBranch.is_busy ? 'Busy Mode Active' : 'Normal Flow'}</span>
              </div>
              <button
                onClick={() => toggleBusyMode(selectedBranch.id, selectedBranch.is_busy)}
                className={`w-12 h-6 rounded-full relative transition-all ${selectedBranch.is_busy ? 'bg-amber-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${selectedBranch.is_busy ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <button onClick={closeModal} className={`p-4 rounded-3xl transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-white/80 text-gray-400 hover:text-black shadow-lg'}`}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

          {/* Node Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              icon={<DollarSign size={18} />}
              label="Net Yield"
              value={`ETB ${selectedBranch.total_revenue.toLocaleString()}`}
              color="emerald"
              isDark={isDark}
            />
            <MetricCard
              icon={<Users size={18} />}
              label="Active Traffic"
              value={selectedBranch.total_customers.toString()}
              color="blue"
              isDark={isDark}
            />
            <MetricCard
              icon={<Package size={18} />}
              label="Inventory"
              value={selectedBranch.products.length.toString()}
              color="purple"
              isDark={isDark}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Operational Details */}
            <div className="lg:col-span-5 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Radar size={14} className="text-emerald-500" />
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Spatial Localization</h4>
                </div>
                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white/40 border-black/5 shadow-lg'}`}>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <MapPin className="text-emerald-500 shrink-0" size={20} />
                      <p className={`text-sm font-medium leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{selectedBranch.address}</p>
                    </div>
                    <div className="flex gap-4">
                      <Phone className="text-blue-500 shrink-0" size={20} />
                      <p className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedBranch.phone}</p>
                    </div>
                    <a
                      href={selectedBranch.map_pin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isDark ? 'bg-white/5 border-white/5 hover:bg-white/10 text-emerald-400' : 'bg-gray-900 text-white shadow-xl'}`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-widest">Open Visual Map</span>
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <UserCheck size={14} className="text-blue-500" />
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Node Authority</h4>
                </div>
                <div className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white/40 border-black/5 shadow-lg'}`}>
                  {selectedBranch.manager ? (
                    <>
                      <div className="flex items-center gap-5 mb-8">
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-2xl font-black ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-950 text-white shadow-xl'}`}>
                          {selectedBranch.manager.name.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedBranch.manager.name}</p>
                          <p className={`text-[9px] font-bold uppercase tracking-widest text-blue-500`}>{selectedBranch.manager.role}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isDark ? 'text-white/20' : 'text-gray-400'}>Protocol Email</span>
                          <span className={isDark ? 'text-white/80' : 'text-gray-950'}>{selectedBranch.manager.email}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isDark ? 'text-white/20' : 'text-gray-400'}>Secure Line</span>
                          <span className={isDark ? 'text-white/80' : 'text-gray-950'}>{selectedBranch.manager.phone}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className={isDark ? 'text-white/20' : 'text-gray-400'}>Auth State</span>
                          <span className="text-emerald-500 uppercase tracking-widest">{selectedBranch.manager.status}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-400'}`}>
                        <User size={24} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isDark ? 'text-white/40' : 'text-gray-500'}`}>No Manager Assigned</p>
                        <p className={`text-[9px] uppercase tracking-widest mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Node Operating Autonomously</p>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Inventory Stream */}
            <div className="lg:col-span-7 space-y-10">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Inventory Manifest</h4>
                  <span className={`text-[8px] font-black uppercase tracking-widest text-emerald-500/60`}>{selectedBranch.products.length} Units</span>
                </div>

                <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-white/[0.01] border-white/10' : 'bg-white/40 border-black/5 shadow-lg'}`}>
                  <table className="w-full text-left">
                    <thead className={`text-[8px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.02] text-white/10' : 'bg-gray-100/30 text-gray-400'}`}>
                      <tr>
                        <th className="px-8 py-5">Product SKU</th>
                        <th className="px-8 py-5">Yield Value</th>
                        <th className="px-8 py-5">Category</th>
                        <th className="px-8 py-5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                      {selectedBranch.products.length > 0 ? selectedBranch.products.map((p) => (
                        <tr key={p.id} className={`text-[11px] font-bold ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                          <td className="px-8 py-5 font-mono text-[9px] tracking-widest text-emerald-500/40">{p.sku}</td>
                          <td className="px-8 py-5 text-white">ETB {p.price.toLocaleString()} / {p.unit}</td>
                          <td className="px-8 py-5 uppercase tracking-tighter">{p.category}</td>
                          <td className="px-8 py-5 text-right">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-auto"></div>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="px-8 py-10 text-center">
                            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/10' : 'text-gray-300'}`}>No Data Streams Available</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* NODE GOVERNANCE SECTION */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldAlert size={14} className="text-rose-500" />
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Node Governance Protocols</h4>
                </div>
                <div className={`p-8 rounded-[2.5rem] border overflow-hidden relative ${isDark ? 'bg-rose-500/[0.02] border-rose-500/10' : 'bg-rose-50 border-rose-100'}`}>
                  <div className="absolute -right-10 -bottom-10 opacity-[0.03] text-rose-500 pointer-events-none">
                    <AlertTriangle size={240} />
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="flex-1">
                      <p className={`text-base font-black uppercase tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Emergency Killswitch</p>
                      <p className={`text-[10px] font-medium leading-relaxed ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        This protocol will immediately revoke all panel access for the branch staff and hide the products from the public network.
                        Use only in cases of severe security breach or operational failure.
                      </p>
                    </div>
                    <button
                      onClick={() => toggleStatus(selectedBranch.id, selectedBranch.status)}
                      className={`px-10 py-5 rounded-2xl flex items-center gap-4 transition-all duration-500 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl ${selectedBranch.status === 'CLOSED'
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                        : 'bg-rose-600 text-white shadow-rose-500/20 hover:bg-rose-700'
                        }`}
                    >
                      {selectedBranch.status === 'CLOSED' ? <Unlock size={18} /> : <Lock size={18} />}
                      {selectedBranch.status === 'CLOSED' ? 'Reactivate Node' : 'Shut Down Panel'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={`p-8 border-t flex items-center justify-end gap-8 ${isDark ? 'border-white/10 bg-black/40' : 'border-black/5 bg-gray-50'}`}>
          <div className="flex items-center gap-4 mr-auto">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600 shadow-sm'}`}>
              <ShieldCheck size={20} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>Audit Ledger Synchronized</p>
          </div>
          <button onClick={closeModal} className={`px-10 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/30 hover:text-white hover:bg-white/5' : 'border-black/10 text-gray-500 hover:text-black hover:bg-gray-100 shadow-sm'}`}>Exit Node</button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Branch Clusters</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Operational Node Deployment // Real-time Flux</p>
        </div>
      </div>

      {/* Global Status Stream */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlobalStat
          label="Active Clusters"
          value={branches.filter(b => b.status === 'ACTIVE').length.toString()}
          sub="Optimal Flow"
          icon={<Activity size={16} />}
          isDark={isDark}
        />
        <GlobalStat
          label="Busy Throttles"
          value={branches.filter(b => b.is_busy).length.toString()}
          sub="Traffic Warning"
          icon={<TrafficCone size={16} />}
          color="amber"
          isDark={isDark}
        />
        <GlobalStat
          label="Deactivated Nodes"
          value={branches.filter(b => b.status === 'CLOSED').length.toString()}
          sub="Revoked Access"
          icon={<Lock size={16} />}
          color="rose"
          isDark={isDark}
        />
      </div>

      <div className={`glass-card shadow-2xl overflow-hidden border-0 ${isDark ? 'bg-white/[0.005]' : 'bg-white/40 border-black/5 shadow-none'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Sync status: Live flux</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Identify node by ID or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-6 py-3 glass-input text-[11px] font-bold w-80 ${isDark ? '' : 'bg-white/60 border-black/10'}`}
              />
            </div>
            <button className={`p-3 glass-card border-white/5 transition-colors ${isDark ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-white text-gray-400 border-black/10 hover:text-black'}`}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.02] text-white/20' : 'bg-gray-100/50 text-gray-400'}`}>
              <tr>
                <th className="px-10 py-6">Node Hub Identity</th>
                <th className="px-10 py-6">Parent Authority</th>
                <th className="px-10 py-6">Traffic Status</th>
                <th className="px-10 py-6">Yield Realized</th>
                <th className="px-10 py-6">Network state</th>
                <th className="px-10 py-6 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
              {filteredBranches.map((branch) => (
                <tr key={branch.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-all duration-500 ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-white text-emerald-600 border border-black/5 shadow-sm'}`}>
                        <MapPin size={22} />
                        {branch.is_busy && <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-pulse border-2 border-black/50"></div>}
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{branch.name}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{branch.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`px-10 py-7 uppercase font-black tracking-widest ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{branch.supermarket_name}</td>
                  <td className="px-10 py-7">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${branch.is_busy ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {branch.is_busy ? <TrafficCone size={10} className="animate-pulse" /> : <Activity size={10} />}
                      {branch.is_busy ? 'Busy Mode' : 'Optimal'}
                    </div>
                  </td>
                  <td className={`px-10 py-7 font-black ${isDark ? 'text-white' : 'text-gray-950'}`}>ETB {(branch.total_revenue / 1000).toFixed(1)}K</td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${branch.status.toUpperCase() === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-gray-700'}`}>{branch.status}</span>
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button
                      onClick={() => handleViewBranch(branch)}
                      className={`p-4 rounded-2xl glass-card transition-all ${isDark ? 'bg-white/[0.01] text-white/10 hover:text-emerald-400 hover:bg-white/5' : 'bg-white text-gray-400 hover:text-emerald-600 shadow-sm'}`}
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedBranch && createPortal(modalContent, document.body)}
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; isDark: boolean }> = ({ icon, label, value, color, isDark }) => (
  <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-black/5 shadow-lg'}`}>
    <div className={`flex items-center gap-3 mb-4`}>
      <div className={`p-2 rounded-xl ${isDark ? `bg-${color}-500/10 text-${color}-400` : `bg-${color}-50 text-${color}-600`}`}>
        {icon}
      </div>
      <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{label}</span>
    </div>
    <p className={`text-2xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>{value}</p>
  </div>
);

const GlobalStat: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; color?: string; isDark: boolean }> = ({ label, value, sub, icon, color = 'emerald', isDark }) => (
  <div className={`glass-card p-6 transition-all shadow-xl group ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/10'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl border ${isDark ? `bg-${color}-500/10 border-white/5 text-${color}-400` : `bg-${color}-50 border-black/5 text-${color}-600`}`}>
        {icon}
      </div>
      <div className={`px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-widest ${isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-500'}`}>
        {sub}
      </div>
    </div>
    <p className={`text-[9px] font-black uppercase tracking-[0.3em] mb-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-2xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>{value}</p>
  </div>
);

export default Branches;
