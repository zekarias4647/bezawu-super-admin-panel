import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Shield, Search, Filter, Hash, User, Clock, Terminal, Activity,
  AlertTriangle, ShieldCheck, ShieldAlert, ChevronRight, Fingerprint,
  MapPin, Store, X, FileText, Database, Globe, Layers, Eye
} from 'lucide-react';

interface LogEntry {
  id: string;
  created_at: string;
  admin_name: string;
  action: string;
  severity: 'INFO' | 'CAUTION' | 'CRITICAL' | 'ERROR' | 'WARN';
  supermarket_name?: string;
  branch_name?: string;
}

const AuditLogs: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'CAUTION' | 'INFO' | 'ERROR' | 'WARN'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`/api/audit-logs?search=${searchTerm}&severity=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'ERROR': return 'bg-rose-500 shadow-[0_0_15px_#f43f5e]';
      case 'CAUTION':
      case 'WARN': return 'bg-amber-500 shadow-[0_0_15px_#f59e0b]';
      default: return 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
    }
  };

  const closeModal = () => setSelectedLog(null);

  const modalContent = selectedLog ? (
    <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      <div
        className={`absolute inset-0 transition-all duration-1000 backdrop-blur-[20px] ${isDark ? 'bg-slate-950/60' : 'bg-white/60'}`}
        onClick={closeModal}
      ></div>

      <div className={`relative w-full max-w-2xl glass-card overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border transition-all ${isDark ? 'bg-[#020617]/80 border-white/10' : 'bg-white/80 border-black/5'}`}>
        {/* Modal Header */}
        <div className={`p-8 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/5' : 'border-black/5 bg-gray-50/50'}`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className={`text-lg font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>Event Signature</h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${isDark ? 'text-white' : 'text-gray-500'}`}>Forensic Audit Detail View</p>
            </div>
          </div>
          <button onClick={closeModal} className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white' : 'bg-black/5 hover:bg-black/10 text-black/40 hover:text-black'}`}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Timestamp</p>
              <div className="flex items-center gap-3">
                <Clock size={16} className="text-blue-500" />
                <span className={`text-sm font-bold font-mono ${isDark ? 'text-white' : 'text-gray-950'}`}>
                  {new Date(selectedLog.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-black/5 border-black/5'}`}>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Severity Level</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${selectedLog.severity === 'CRITICAL' || selectedLog.severity === 'ERROR' ? 'bg-rose-500 animate-pulse' : selectedLog.severity === 'CAUTION' || selectedLog.severity === 'WARN' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <span className={`text-sm font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>
                  {selectedLog.severity}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 pl-1">Target Scope</p>
            <div className={`p-6 rounded-3xl border flex flex-col gap-4 ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-black/5 shadow-lg'}`}>

              {/* Admin Info */}
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                  <User size={18} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Executor</p>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedLog.admin_name || 'System Kernel'}</p>
                </div>
              </div>

              {/* Supermarket Info */}
              {selectedLog.supermarket_name && (
                <>
                  <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                      <Store size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Organization</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedLog.supermarket_name}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Branch Info */}
              {selectedLog.branch_name && (
                <>
                  <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-100 text-pink-600'}`}>
                      <MapPin size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Node Location</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-950'}`}>{selectedLog.branch_name}</p>
                    </div>
                  </div>
                </>
              )}

              {!selectedLog.supermarket_name && !selectedLog.branch_name && (
                <>
                  <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}></div>
                  <div className="flex items-center gap-4 opacity-50">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                      <Globe size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-50">Scope</p>
                      <p className={`text-sm font-bold italic ${isDark ? 'text-white' : 'text-gray-950'}`}>Global System Event</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 pl-1">Action Payload</p>
            <div className={`p-5 rounded-2xl border font-mono text-xs leading-relaxed ${isDark ? 'bg-black/40 border-white/10 text-emerald-400' : 'bg-gray-900 text-emerald-400 shadow-inner'}`}>
              {selectedLog.action}
            </div>
          </div>

          <div className={`p-4 rounded-xl flex items-center justify-between ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <div className="flex items-center gap-3">
              <Fingerprint size={16} className="opacity-40" />
              <span className="text-[10px] font-mono opacity-40">{selectedLog.id}</span>
            </div>
            <div className="text-[9px] font-black uppercase tracking-widest opacity-30">Verified</div>
          </div>

        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Chronos Ledger</h1>
          <p className={`text-xs font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white' : 'text-gray-500'}`}>Forensic Administrative Stream // Secure Immutable Audit</p>
        </div>
        <div className="flex gap-4">
          <div className={`px-6 py-3 glass-card flex items-center gap-4 border-white/5 ${isDark ? 'bg-white/5' : 'bg-white shadow-xl'}`}>
            <Fingerprint size={18} className="text-emerald-500" />
            <span className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>Ledger Authenticated</span>
          </div>
        </div>
      </div>

      <div className={`glass-card overflow-hidden ${isDark ? 'bg-white/[0.005]' : 'bg-white border-black/5 shadow-none'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className={`text-xs font-black uppercase tracking-[0.4em] ${isDark ? 'text-white' : 'text-gray-950'}`}>Real-time Forensic Monitoring</span>
            </div>
            <div className="flex bg-black/10 rounded-xl p-1">
              {(['ALL', 'CRITICAL', 'CAUTION', 'INFO', 'ERROR', 'WARN'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white/10 text-white' : `${isDark ? 'text-white' : 'text-gray-950'} hover:${isDark ? 'text-white' : 'text-emerald-500'}`}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Query action or admin ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-6 py-4 glass-input ${isDark ? 'text-white' : 'text-gray-950'} text-sm font-bold w-80 ${isDark ? '' : 'bg-white/10'}`}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className={`text-[11px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.01] text-white' : 'bg-gray-100/20 text-gray-400'}`}>
              <tr>
                <th className="px-10 py-6">Timestamp / Beam</th>
                <th className="px-10 py-6">Action Identifier</th>
                <th className="px-10 py-6">Authority</th>
                <th className="px-10 py-6">Scope / Context</th>
                <th className="px-10 py-6 text-right">Protocol</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
              {logs.map((log) => (
                <tr key={log.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-1.5 h-12 rounded-full ${getSeverityStyles(log.severity)}`}></div>
                      <div>
                        <p className={`text-sm font-black tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>
                          {new Date(log.created_at).toLocaleDateString()}
                        </p>
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 ${isDark ? 'text-white' : 'text-gray-950'}`}>
                          {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <p className={`text-sm font-black tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'} truncate max-w-[200px]`}>{log.action}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${log.severity === 'CRITICAL' || log.severity === 'ERROR' ? 'text-rose-500' : log.severity === 'CAUTION' || log.severity === 'WARN' ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {log.severity} Protocol
                    </p>
                  </td>
                  <td className="px-10 py-8 uppercase font-black tracking-widest">
                    <div className="flex items-center gap-3">
                      <User size={16} className="text-emerald-500" />
                      <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-950'}`}>{log.admin_name || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-2">
                      {log.supermarket_name ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
                          <Store size={12} className="text-orange-400" />
                          <span className={isDark ? 'text-white' : 'text-gray-800'}>{log.supermarket_name}</span>
                        </div>
                      ) : null}
                      {log.branch_name ? (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-70">
                          <MapPin size={12} className="text-pink-400" />
                          <span className={isDark ? 'text-white' : 'text-gray-800'}>{log.branch_name}</span>
                        </div>
                      ) : null}
                      {!log.supermarket_name && !log.branch_name && (
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-30">
                          <Globe size={12} />
                          <span>Global</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 rounded-2xl glass-card transition-all ${isDark ? 'bg-white/[0.01] text-white/10 hover:text-emerald-400 hover:bg-white/5' : 'bg-white text-gray-400 hover:text-emerald-600 shadow-sm'}`}>
                      <Eye size={22} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal Portal */}
      {selectedLog && createPortal(modalContent, document.body)}
    </div>
  );
};

export default AuditLogs;

