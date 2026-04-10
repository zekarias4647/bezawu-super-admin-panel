import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { getImageUrl } from '../../utils/url';
import {
  User, Mail, Phone, Car, ShieldCheck,
  Search, Filter, Eye, X, CreditCard,
  ShoppingBag, History, UserCheck, AlertCircle,
  Hash, Palette, TrendingUp, Package, MapPin, Clock, ChevronRight
} from 'lucide-react';

interface UsersProps {
  theme?: 'light' | 'dark';
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  id: string;
  branch_name: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  total_price: number;
  car_model: string;
  car_plate: string;
  car_color: string;
  created_at: string;
  items: OrderItem[];
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  car_plate: string;
  car_model: string;
  car_color: string;
  is_verified: boolean;
  profile_picture: string;
  orders: Order[];
}


const Users: React.FC<UsersProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/users?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCustomers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user: Customer) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedUser(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUser(user); // Fallback to basic data
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const closeModal = () => {
    setSelectedUser(null);
    setSelectedOrder(null);
  };

  const closeOrderModal = () => setSelectedOrder(null);

  const totalSpent = selectedUser?.orders.reduce((acc, curr) => acc + Number(curr.total_price), 0) || 0;

  const orderDetailModal = selectedOrder ? (
    <div className="fixed inset-0 w-screen h-screen z-[100000] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Absolute Backdrop for the secondary modal */}
      <div
        className={`absolute inset-0 backdrop-blur-[40px] ${isDark ? 'bg-black/60' : 'bg-white/40'}`}
        onClick={closeOrderModal}
      ></div>

      <div className={`relative w-full max-w-2xl glass-card overflow-hidden shadow-2xl border ${isDark ? 'bg-slate-900/80 border-white/10' : 'bg-white/90 border-black/5'}`}>
        <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShoppingBag size={24} />
            </div>
            <div>
              <h3 className={`text-xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Details</h3>
              <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedOrder.id}</p>
            </div>
          </div>
          <button onClick={closeOrderModal} className={`p-2 rounded-xl ${isDark ? 'text-white/20 hover:text-white' : 'text-gray-400 hover:text-black'}`}>
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-black/5'}`}>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white' : 'text-gray-400'}`}>Node Origin</p>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-emerald-500" />
                <span className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>{selectedOrder.branch_name}</span>
              </div>
            </div>
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-black/5'}`}>
              <p className={`text-[8px] font-black uppercase tracking-widest mb-2 ${isDark ? 'text-white' : 'text-gray-400'}`}>Timestamp</p>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span className={`text-xs font-bold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>
                  {new Date(selectedOrder.created_at).toLocaleDateString()} // {new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Inventory Manifest</h4>
            <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-black/20 border-white/5' : 'bg-white border-black/5'}`}>
              <table className="w-full text-left">
                <thead className={`text-[8px] uppercase font-black tracking-widest ${isDark ? 'bg-white/[0.02] text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <tr>
                    <th className="px-5 py-3">Product</th>
                    <th className="px-5 py-3 text-center">Qty</th>
                    <th className="px-5 py-3 text-right">Yield</th>
                  </tr>
                </thead>
                <tbody className={`text-[10px] font-bold divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td className={`px-5 py-3 ${isDark ? 'text-white' : 'text-gray-700'}`}>{item.name}</td>
                      <td className={`px-5 py-3 text-center ${isDark ? 'text-white' : 'text-gray-400'}`}>{item.quantity} {item.unit}</td>
                      <td className={`px-5 py-3 text-right ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>ETB {Number(item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`p-6 rounded-3xl flex justify-between items-center ${isDark ? 'bg-emerald-500/5 border border-emerald-500/10' : 'bg-emerald-50 border border-emerald-200'}`}>
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white/60' : 'text-emerald-700'}`}>Total Settlement</span>
            <span className={`text-2xl font-black ${isDark ? 'text-white' : 'text-emerald-900'}`}>ETB {Number(selectedOrder.total_price).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-8 border-t flex justify-end gap-4">
          <button onClick={closeOrderModal} className={`px-8 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isDark ? 'border-white/10 text-white/40 hover:text-white hover:bg-white/5' : 'border-black/10 text-gray-500 hover:text-black hover:bg-gray-50'}`}>Dismiss</button>
          <button className="px-8 py-3 btn-primary text-[9px] font-black uppercase tracking-widest rounded-xl">Download Receipt</button>
        </div>
      </div>
    </div>
  ) : null;

  const modalContent = selectedUser ? (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500 overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-1000 backdrop-blur-[120px] ${isDark ? 'bg-slate-950/10' : 'bg-white/5'}`}
        onClick={closeModal}
      ></div>

      {/* Profile Card */}
      <div className={`relative w-full max-w-6xl glass-card overflow-hidden shadow-2xl border transition-all duration-500 flex flex-col max-h-[94vh] ${isDark ? 'bg-white/[0.005] border-white/10' : 'bg-white/10 border-black/5'}`}>

        {/* Modal Header */}
        <div className={`p-10 border-b relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 ${isDark ? 'border-white/5 bg-white/[0.01]' : 'border-black/5 bg-gray-50/5'}`}>
          <div className="flex items-center gap-8 z-10">
            <div className={`w-32 h-32 rounded-[3rem] p-1 relative group overflow-hidden ${isDark ? 'bg-emerald-500/10' : 'bg-white/40 shadow-lg'}`}>
              <img
                src={getImageUrl(selectedUser.profile_picture)}
                alt={selectedUser.name}
                className="w-full h-full object-cover rounded-[2.8rem] relative z-10"
              />
            </div>
            <div>
              <div className="flex items-center gap-4 mb-2">
                <h2 className={`text-4xl font-black font-poppins tracking-tighter uppercase leading-none ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedUser.name}</h2>
                {selectedUser.is_verified && (
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                    Verified User
                  </div>
                )}
              </div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.5em] ${isDark ? 'text-white/60' : 'text-gray-400'}`}>Customer ID: {selectedUser.id}</p>
            </div>
          </div>
          <button onClick={closeModal} className={`p-4 rounded-3xl transition-all ${isDark ? 'bg-white/5 text-white/20 hover:text-white hover:bg-white/10' : 'bg-white/40 text-gray-400 hover:text-black'}`}>
            <X size={28} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Left Col: Contact & Vehicle */}
            <div className="lg:col-span-5 space-y-10">
              <section>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] mb-6 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Identity Protocol</h4>
                <div className={`space-y-4 p-8 rounded-[2rem] border ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-white/20 border-black/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Mail size={18} />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>{selectedUser.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Phone size={18} />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-700'}`}>{selectedUser.phone}</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] mb-6 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Registered Vehicle</h4>
                <div className={`p-8 rounded-[2.5rem] border relative overflow-hidden ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-white/20 border-black/5'}`}>
                  <div className="flex items-center gap-6 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDark ? 'bg-white/5 text-blue-400/40' : 'bg-blue-50 text-blue-600'}`}>
                      <Car size={24} />
                    </div>
                    <div>
                      <p className={`text-lg font-black tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedUser.car_model}</p>
                      <p className={`text-[9px] font-black uppercase tracking-widest text-emerald-500`}>Active Unit</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Hash size={12} className="text-white/40" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Plate ID</span>
                      </div>
                      <p className={`text-sm font-black tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedUser.car_plate}</p>
                    </div>
                    <div className={`p-5 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-black/5'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Palette size={12} className="text-white/40" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/40">Hue Index</span>
                      </div>
                      <p className={`text-sm font-black tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedUser.car_color}</p>
                    </div>
                  </div>
                </div>
              </section>

              <div className={`p-8 rounded-[2rem] border ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50 border-emerald-100'}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className={`text-[10px] font-black uppercase tracking-widest text-emerald-500`}>Lifetime Yield</p>
                  <TrendingUp size={16} className="text-emerald-500" />
                </div>
                <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-gray-950'}`}>ETB {totalSpent.toLocaleString()}</p>
                <p className={`text-[9px] font-medium mt-2 uppercase tracking-tight ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Aggregated platform intake from {selectedUser.orders.length} events.</p>
              </div>
            </div>

            {/* Right Col: Order History */}
            <div className="lg:col-span-7 space-y-8">
              <div className="flex justify-between items-end">
                <h4 className={`text-[10px] font-black uppercase tracking-[0.5em] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Transaction Stream</h4>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{selectedUser.orders.length} Fiscal Logs</p>
              </div>

              <div className={`rounded-[2.5rem] border overflow-hidden ${isDark ? 'bg-white/[0.005] border-white/5' : 'bg-white/20 border-black/5'}`}>
                <table className="w-full text-left">
                  <thead className={`text-[8px] uppercase font-black tracking-widest ${isDark ? 'bg-white/[0.01] text-white/40' : 'bg-gray-100/30 text-gray-400'}`}>
                    <tr>
                      <th className="px-8 py-5">Order ID</th>
                      <th className="px-8 py-5">Origin Node</th>
                      <th className="px-8 py-5">Timestamp</th>
                      <th className="px-8 py-5">Yield</th>
                      <th className="px-8 py-5 text-right">Manifest</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                    {selectedUser.orders.map((o) => (
                      <tr key={o.id} className={`text-[11px] font-bold group/row transition-all ${isDark ? 'text-white hover:bg-white/[0.02]' : 'text-gray-800 hover:bg-gray-50'}`}>
                        <td className={`px-8 py-5 font-mono text-[9px] tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{o.id}</td>
                        <td className="px-8 py-5 uppercase tracking-tighter">{o.branch_name}</td>
                        <td className={`px-8 py-5 text-[9px] uppercase ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                          {new Date(o.created_at).toLocaleDateString()} | {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-8 py-5 font-black">ETB {Number(o.total_price).toLocaleString()}</td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className={`p-2 rounded-lg transition-all ${isDark ? 'text-white/10 hover:text-emerald-400 hover:bg-white/5' : 'text-gray-400 hover:text-emerald-600 hover:bg-white shadow-sm'}`}
                          >
                            <ChevronRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-10 border-t flex justify-end gap-6 ${isDark ? 'border-white/5 bg-white/[0.005]' : 'border-black/5 bg-white/20'}`}>
          <button onClick={closeModal} className={`px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${isDark ? 'border-white/10 text-white/30 hover:text-white hover:bg-white/5' : 'border-black/10 text-gray-500 hover:text-black'}`}>Exit Profile</button>
          <button className="px-12 py-4 btn-primary text-[10px] font-black uppercase tracking-widest rounded-2xl">Modify Access</button>
        </div>
      </div>

      {/* Portaled Order Detail Overlay */}
      {selectedOrder && createPortal(orderDetailModal, document.body)}
    </div>
  ) : null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Customers</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Active Biological Units // Platform Network</p>
        </div>
      </div>

      <div className={`glass-card overflow-hidden ${isDark ? 'bg-white/[0.005]' : 'bg-white/20 border-black/5 shadow-none'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Filter users by identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-6 py-3 glass-input text-[11px] font-bold w-64 ${isDark ? '' : 'bg-white/10'}`}
              />
            </div>
            <button className={`p-3 glass-card border-white/5 transition-colors ${isDark ? 'bg-white/[0.01] text-white/10 hover:text-white' : 'bg-white/40 text-gray-400 hover:text-black'}`}>
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.005] text-white' : 'bg-gray-100/20 text-gray-400'}`}>
              <tr>
                <th className="px-10 py-6">Customer Profile</th>
                <th className="px-10 py-6">Registered Plate</th>
                <th className="px-10 py-6">Vehicle Model</th>
                <th className="px-10 py-6 text-center">Verification</th>
                <th className="px-10 py-6 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
              {customers.map((user) => (
                <tr key={user.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-5">
                      <div className={`w-12 h-12 rounded-2xl overflow-hidden relative group-hover:scale-110 transition-all duration-500 ${isDark ? 'bg-white/5' : 'bg-white/40 border border-black/5 shadow-sm'}`}>
                        <img src={getImageUrl(user.profile_picture)} alt={user.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{user.name}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{user.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`px-4 py-1.5 rounded-lg font-mono text-[10px] font-black tracking-widest border ${isDark ? 'bg-black/40 border-white/5 text-emerald-400/60' : 'bg-white border-black/5 shadow-sm text-gray-800'}`}>
                      {user.car_plate}
                    </span>
                  </td>
                  <td className={`px-10 py-7 uppercase font-black tracking-widest ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{user.car_model}</td>
                  <td className="px-10 py-7 text-center">
                    <div className="flex items-center justify-center">
                      {user.is_verified ? (
                        <div className={`p-2 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-50 text-emerald-600'}`}>
                          <UserCheck size={16} />
                        </div>
                      ) : (
                        <div className={`p-2 rounded-full ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                          <AlertCircle size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <button
                      onClick={() => handleViewUser(user)}
                      className={`p-4 rounded-2xl glass-card transition-all ${isDark ? 'bg-white/[0.01] text-white hover:text-emerald-400 hover:bg-white/5' : 'bg-white/60 text-gray-400 hover:text-emerald-600 shadow-sm'}`}
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`p-8 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'border-white/5 text-white/40' : 'border-black/5 text-gray-400'}`}>
          <p>{customers.length} Identity Nodes Syncing</p>
        </div>
      </div>

      {selectedUser && createPortal(modalContent, document.body)}
    </div>
  );
};

export default Users;

