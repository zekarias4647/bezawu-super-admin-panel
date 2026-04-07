import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { getImageUrl } from '../../utils/url';
import { Plus, Search, Filter, Eye, X, Globe, Phone, Mail, Landmark, ShieldCheck, ShieldAlert, Download, CheckCircle, AlertCircle, Wallet, Users, Layers, TrendingUp, Radar, Store } from 'lucide-react';

interface SupermarketsProps {
  theme?: 'light' | 'dark';
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  is_primary: boolean;
}

interface Supermarket {
  id: string;
  name: string;
  logo: string;
  tin: string;
  email: string;
  phone: string;
  website: string;
  reg_code: string;
  vat_cert: string;
  business_license: string;
  branches: number;
  status: 'OPERATIONAL' | 'PENDING' | 'SUSPENDED' | 'active' | 'suspended';
  bankAccounts: BankAccount[];
  total_revenue: number;
  total_customers: number;
  total_inventory: number;
}

interface ImageViewerProps {
  src: string;
  onClose: () => void;
  isDark: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, onClose, isDark }) => (
  <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-20 group animate-in fade-in duration-300">
    <div
      className={`absolute inset-0 backdrop-blur-3xl transition-all duration-500 ${isDark ? 'bg-slate-950/80' : 'bg-white/60'}`}
      onClick={onClose}
    ></div>
    <div className="relative max-w-full max-h-full transition-all duration-700 animate-in zoom-in-95">
      <img src={src} className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border border-white/10" alt="Full view" />
      <button
        onClick={onClose}
        className="absolute -top-12 right-0 p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-xl"
      >
        <X size={24} />
      </button>
    </div>
  </div>
);

const Supermarkets: React.FC<SupermarketsProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [selectedEntity, setSelectedEntity] = useState<Supermarket | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [entities, setEntities] = useState<Supermarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');

  const fetchSupermarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get('https://superapi.bezawcurbside.com/api/supermarkets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setEntities(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching supermarkets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupermarkets();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.patch(`https://superapi.bezawcurbside.com/api/supermarkets/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        fetchSupermarkets();
        closeModal();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entity.tin.includes(searchTerm);
    const matchesFilter = filter === 'ALL' || entity.status.toUpperCase() === 'PENDING';
    return matchesSearch && matchesFilter;
  });

  const closeModal = () => setSelectedEntity(null);

  const modalContent = selectedEntity ? (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      <div
        className={`absolute inset-0 transition-all duration-1000 backdrop-blur-[120px] ${isDark ? 'bg-slate-950/30' : 'bg-white/20'}`}
        onClick={closeModal}
      ></div>

      <div className={`relative w-full max-w-7xl glass-card overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.5)] border transition-all duration-500 flex flex-col max-h-[96vh] ${isDark ? 'bg-[#020617]/40 border-white/10' : 'bg-white/40 border-black/5'}`}>

        {/* Modal Header */}
        <div className={`p-8 border-b relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-gray-50/5'}`}>
          <div className="flex items-center gap-6 z-10">
            <div className={`w-20 h-20 rounded-[2rem] p-1 shadow-2xl relative group ${isDark ? 'bg-emerald-500/20' : 'bg-white/80'}`}>
              <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src={getImageUrl(selectedEntity.logo)}
                alt={selectedEntity.name}
                className="w-full h-full object-cover rounded-[1.8rem] relative z-10"
              />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className={`text-3xl font-black font-poppins tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedEntity.name}</h2>
                <div className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${selectedEntity.status.toUpperCase() === 'ACTIVE' || selectedEntity.status.toUpperCase() === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                  {selectedEntity.status}
                </div>
              </div>
              <p className={`text-[9px] font-bold uppercase tracking-[0.5em] ${isDark ? 'text-emerald-400/50' : 'text-emerald-700'}`}>Node ID: {selectedEntity.reg_code}</p>
            </div>
          </div>

          <button onClick={closeModal} className={`p-4 rounded-[1.5rem] transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10' : 'bg-white/60 text-gray-400 hover:text-black shadow-lg'}`}>
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10">

          {/* COMPACT KPI HEADER */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-0.5 w-10 bg-emerald-500 rounded-full"></div>
              <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Global Yield Analysis</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-black/5 shadow-lg shadow-gray-200/50'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <Wallet size={16} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Gross Yield</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={`text-[10px] font-black tracking-widest ${isDark ? 'text-white/30' : 'text-gray-400'}`}>ETB</span>
                  <p className={`text-2xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>
                    {selectedEntity.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-black/5 shadow-lg shadow-gray-200/50'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    <Users size={16} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Population</span>
                </div>
                <p className={`text-3xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>
                  {selectedEntity.total_customers.toLocaleString()}
                </p>
              </div>

              <div className={`p-6 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-white border-black/5 shadow-lg shadow-gray-200/50'}`}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                    <Store size={16} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Branches</span>
                </div>
                <p className={`text-3xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>
                  {selectedEntity.branches.toLocaleString()}
                </p>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Radar size={14} className="text-emerald-500" />
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Fiscal Verification</h4>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.05] border-white/10' : 'bg-white/40 border-black/5'}`}>
                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>TIN Identifier</p>
                    <p className={`text-sm font-black font-mono tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedEntity.tin}</p>
                  </div>
                </div>
              </section>

              <section>
                <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] mb-6 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Bank Settlement</h4>
                {selectedEntity.bankAccounts.map((acc) => (
                  <div key={acc.id} className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all ${isDark ? 'bg-white/[0.05] border-white/10 hover:bg-emerald-500/[0.05]' : 'bg-white/40 border-black/5 hover:bg-white/80 shadow-md'}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-950 text-white shadow-lg'}`}>
                        <Landmark size={18} />
                      </div>
                      <div>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{acc.bank_name}</p>
                        <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{acc.account_name}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl font-mono text-base font-black tracking-[0.2em] text-center ${isDark ? 'bg-black/40 text-emerald-400 shadow-inner' : 'bg-white/60 text-gray-800 border border-black/10'}`}>
                      {acc.account_number.match(/.{1,4}/g)?.join(' ')}
                    </div>
                  </div>
                ))}
              </section>
            </div>

            <div className="lg:col-span-7 space-y-10">
              <section>
                <div className="flex justify-between items-center mb-6">
                  <h4 className={`text-[9px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Vault Evidence</h4>
                  <span className={`text-[8px] font-black uppercase tracking-widest text-emerald-500/60`}>Assets</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[{ label: 'VAT Cert', img: selectedEntity.vat_cert }, { label: 'License', img: selectedEntity.business_license }].map((doc, i) => (
                    <div key={i} className="space-y-3 group">
                      <div className={`relative aspect-[3/4] rounded-[2rem] overflow-hidden border transition-all duration-700 group-hover:scale-[1.02] shadow-xl ${isDark ? 'border-white/10 bg-white/5' : 'border-black/5 bg-white/40'}`}>
                        <img src={getImageUrl(doc.img)} alt={doc.label} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setZoomedImage(getImageUrl(doc.img))}
                            className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all"
                          >
                            <Eye size={20} />
                          </button>
                        </div>
                      </div>
                      <p className={`text-[9px] font-black text-center uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{doc.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={`p-8 border-t flex items-center justify-between gap-8 ${isDark ? 'border-white/10 bg-black/40' : 'border-black/5 bg-gray-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-100 text-amber-600 shadow-sm'}`}>
              <AlertCircle size={20} />
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>Authorization Required</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusUpdate(selectedEntity.id, 'suspended')}
              className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isDark ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}>Decline</button>
            <button
              onClick={() => handleStatusUpdate(selectedEntity.id, 'active')}
              className="px-10 py-3 btn-primary text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg">Authorize</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Supermarkets</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Global Fiscal Registry & Compliance Hub</p>
        </div>
        <button className={`btn-primary px-8 py-4 text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all ${isDark ? 'shadow-emerald-500/10' : ''}`}>
          <Plus size={16} />
          Register New Supermarket
        </button>
      </div>

      <div className={`glass-card shadow-2xl overflow-hidden border-0 ${isDark ? 'bg-white/[0.02]' : 'bg-white/40 border-black/5 shadow-none'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Network Status: Operational</span>
            </div>
            <div className="h-4 w-px bg-white/10 hidden md:block"></div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-5 py-2 glass-card text-[9px] font-black rounded-xl uppercase tracking-widest ${filter === 'ALL' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-500/20') : (isDark ? 'bg-white/5 text-white/20 border-white/5 hover:text-white' : 'bg-white text-gray-400 border-black/5 hover:text-black')}`}>All Entities</button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`px-5 py-2 glass-card text-[9px] font-black rounded-xl uppercase tracking-widest transition-all ${filter === 'PENDING' ? (isDark ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-500/20') : (isDark ? 'bg-white/5 text-white/20 border-white/5 hover:text-white' : 'bg-white text-gray-400 border-black/5 hover:text-black')}`}>Pending Audit</button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search secure database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-6 py-3 glass-input text-[11px] font-bold w-80 ${isDark ? '' : 'bg-white/60 border-black/10'}`}
              />
            </div>
            <button className={`p-3 glass-card border-white/10 transition-colors ${isDark ? 'bg-white/5 text-white/20 hover:text-white' : 'bg-white text-gray-400 border-black/10 hover:text-black'}`}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.02] text-white/20' : 'bg-gray-100/50 text-gray-400'}`}>
              <tr>
                <th className="px-10 py-6">Identity Profile</th>
                <th className="px-10 py-6">Protocol ID</th>
                <th className="px-10 py-6">Fiscal TIN</th>
                <th className="px-10 py-6 text-center">Branches</th>
                <th className="px-10 py-6">Security State</th>
                <th className="px-10 py-6 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                      <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Decrypting Secure Nodes...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEntities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No matching entities detected in subnet</p>
                  </td>
                </tr>
              ) : (
                filteredEntities.map((entity) => (
                  <SupermarketTableRow
                    key={entity.id}
                    entity={entity}
                    isDark={isDark}
                    onView={() => setSelectedEntity(entity)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={`p-8 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'border-white/5 text-white/20' : 'border-black/5 text-gray-400'}`}>
          <p>Displaying {filteredEntities.length} Secure Node(s)</p>
          <div className="flex gap-3">
            <button className={`px-6 py-2.5 glass-card border-white/5 hover:text-white disabled:opacity-30 ${isDark ? 'bg-white/5' : 'bg-white text-gray-400 hover:text-black'}`}>Prev</button>
            <button className={`px-6 py-2.5 glass-card border-white/5 hover:text-white ${isDark ? 'bg-white/5' : 'bg-white text-gray-400 hover:text-black'}`}>Next</button>
          </div>
        </div>
      </div>

      {selectedEntity && createPortal(modalContent, document.body)}
      {zoomedImage && createPortal(<ImageViewer src={zoomedImage} onClose={() => setZoomedImage(null)} isDark={isDark} />, document.body)}
    </div>
  );
};

const SupermarketTableRow: React.FC<{ entity: Supermarket; isDark: boolean; onView: () => void }> = ({ entity, isDark, onView }) => (
  <tr className={`transition-all group ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white/60'}`}>
    <td className="px-10 py-7">
      <div className="flex items-center space-x-6">
        <div className={`w-14 h-14 rounded-2xl shadow-xl overflow-hidden relative group-hover:scale-110 group-hover:-rotate-2 transition-all duration-500 ${isDark ? 'border border-white/5' : 'border border-black/5'}`}>
          <img src={getImageUrl(entity.logo)} alt={entity.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-emerald-500/10 group-hover:opacity-0 transition-opacity"></div>
        </div>
        <div>
          <p className={`text-base font-black uppercase tracking-tighter leading-none ${isDark ? 'text-white' : 'text-gray-950'}`}>{entity.name}</p>
          <p className={`text-[9px] uppercase tracking-[0.3em] mt-2 font-bold ${isDark ? 'text-emerald-400/50' : 'text-emerald-600'}`}>Validated Partner</p>
        </div>
      </div>
    </td>
    <td className={`px-10 py-7 font-mono text-[11px] tracking-widest font-black ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{entity.reg_code}</td>
    <td className={`px-10 py-7 uppercase font-black tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{entity.tin}</td>
    <td className="px-10 py-7 text-center">
      <span className={`inline-block px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isDark ? 'bg-white/5 border-white/5 text-white/60 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 group-hover:border-emerald-500/30' : 'bg-white/60 border-black/5 text-gray-700 hover:bg-white'}`}>
        {entity.branches} Nodes
      </span>
    </td>
    <td className="px-10 py-7">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full animate-pulse ${entity.status.toUpperCase() === 'ACTIVE' || entity.status.toUpperCase() === 'OPERATIONAL' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : entity.status.toUpperCase() === 'PENDING' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'}`}></div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
          {entity.status}
        </span>
      </div>
    </td>
    <td className="px-10 py-7 text-right">
      <button
        onClick={onView}
        className={`p-4 rounded-2xl glass-card border border-white/10 transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-emerald-400 hover:bg-white/10 hover:shadow-emerald-500/20' : 'bg-white text-gray-400 hover:text-emerald-600 shadow-sm'}`}
      >
        <Eye size={22} />
      </button>
    </td>
  </tr>
);

export default Supermarkets;

