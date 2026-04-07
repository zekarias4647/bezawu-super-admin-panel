

import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Store, MapPin, BarChart3, LogOut, Settings, Bell, Search, Hexagon, Sun, Moon, Users as UsersIcon, MessageSquareQuote, Radar, Wallet, Shield, Palette, Briefcase, ImageIcon, Smartphone } from 'lucide-react';
import axios from 'axios';


interface LayoutProps {
  onLogout: () => void;
  theme: string;
  mode: 'light' | 'dark';
  onModeToggle: () => void;
}

const Layout: React.FC<LayoutProps> = ({ onLogout, theme, mode, onModeToggle }) => {
  const isDark = mode === 'dark';
  const [admin, setAdmin] = useState<{
    fullName: string;
    email: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');

        if (!token) {
          console.error('No auth token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('https://superapi.bezawcurbside.com/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setAdmin(response.data.admin);
        }
      } catch (error) {
        console.error('Failed to fetch admin profile:', error);
        // If token is invalid, logout
        if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('adminData');
          onLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, [onLogout]);


  return (
    <div className={`flex h-full relative overflow-hidden transition-all duration-700 bg-[var(--bg-primary)] text-[var(--text-primary)]`}>
      <div className="mesh-blob blob-1"></div>
      <div className="mesh-blob blob-2"></div>

      <aside className={`w-64 glass-card m-4 mr-0 rounded-[2.5rem] flex flex-col relative z-10 transition-all duration-500`}>
        <div className={`p-10 border-b border-[var(--border-color)]`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 glass-card flex items-center justify-center shadow-lg relative overflow-hidden group transition-all bg-[var(--accent)] bg-opacity-10`}>
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)] to-cyan-500 opacity-10"></div>
              <Hexagon className="text-[var(--accent)] w-6 h-6 relative z-10" />
            </div>
            <div>
              <span className={`font-poppins font-bold text-lg tracking-tight text-[var(--text-primary)]`}>Bezaw</span>
              <span className={`text-[10px] font-black uppercase tracking-[0.3em] block leading-none text-[var(--accent)] opacity-50`}>Terminal</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <SidebarLink to="/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarLink to="/supermarkets" icon={<Store size={18} />} label="Supermarkets" />
          <SidebarLink to="/branches" icon={<MapPin size={18} />} label="Branches" />
          {/* <SidebarLink to="/network" icon={<Radar size={18} />} label="Network Pulse" /> */}
          <SidebarLink to="/finance" icon={<Wallet size={18} />} label="Finance Hub" />
          <SidebarLink to="/business-types" icon={<Briefcase size={18} />} label="Business Types" />
          <SidebarLink to="/ads" icon={<ImageIcon size={18} />} label="App Ads" />
          <SidebarLink to="/users" icon={<UsersIcon size={18} />} label="Users" />
          <SidebarLink to="/feedback" icon={<MessageSquareQuote size={18} />} label="Feedback" />
          <SidebarLink to="/app-feedback" icon={<Smartphone size={18} />} label="App Feedback" />
          <SidebarLink to="/audit" icon={<Shield size={18} />} label="Audit Ledger" />
          <SidebarLink to="/settings" icon={<Settings size={18} />} label="System Config" />
        </nav>

        <div className={`p-6 border-t border-[var(--border-color)]`}>
          <button
            onClick={onLogout}
            className={`w-full flex items-center px-4 py-3.5 space-x-4 transition-all font-bold text-[11px] uppercase tracking-widest opacity-40 hover:text-red-400 hover:opacity-100 hover:bg-red-500/5 rounded-2xl`}
          >
            <LogOut size={18} />
            <span>Shutdown</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative z-20">
        <header className="h-24 flex items-center justify-between px-10">
          <div className={`flex items-center glass-card rounded-2xl px-5 py-3 w-[420px] transition-all bg-[var(--bg-input)]`}>
            <Search size={18} className="opacity-20" />
            <input
              type="text"
              placeholder="Search secure database..."
              className={`bg-transparent border-none focus:ring-0 text-sm ml-3 w-full outline-none font-medium text-[var(--text-primary)] placeholder:opacity-20`}
            />
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={onModeToggle}
              className={`p-3 glass-card flex items-center justify-center transition-all text-[var(--accent)] hover:bg-opacity-20`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NavLink to="/settings" className={`p-3 glass-card flex items-center justify-center transition-all text-[var(--accent)] hover:bg-opacity-20`}>
              <Palette size={20} />
            </NavLink>
            <button className={`relative p-3 glass-card bg-opacity-5 transition-all opacity-40 hover:opacity-100 hover:text-[var(--accent)]`}>
              <Bell size={20} />
              <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 bg-emerald-500 border-[var(--bg-primary)]`}></span>
            </button>
            <div className={`flex items-center space-x-4 border-l pl-8 border-[var(--border-color)]`}>
              <div className="text-right">
                <p className={`text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]`}>
                  {loading ? 'Loading...' : (admin?.fullName || 'Admin')}
                </p>
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent)] opacity-50`}>
                  {admin?.role?.replace('_', ' ') || 'Verified'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl glass-card border-[var(--border-color)] flex items-center justify-center relative overflow-hidden`}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {admin?.fullName?.charAt(0) || 'A'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      flex items-center px-4 py-3.5 space-x-4 rounded-2xl transition-all font-bold text-[11px] uppercase tracking-widest
      ${isActive
        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[0_10px_25px_rgba(0,0,0,0.15)] scale-[1.02]'
        : 'opacity-40 hover:opacity-100 hover:text-[var(--text-primary)] hover:bg-white/5'}
    `}
  >
    {({ isActive }) => (
      <>
        <span className={isActive ? 'text-[var(--accent)]' : ''}>{icon}</span>
        <span className={isActive ? 'text-[var(--bg-primary)]' : ''}>{label}</span>
      </>
    )}
  </NavLink>
);

export default Layout;

