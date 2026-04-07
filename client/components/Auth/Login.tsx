
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Zap, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string, admin: any) => void;
  onForgot: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://superapi.bezawcurbside.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        onLogin(data.token, data.admin);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleSubmit}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white font-poppins tracking-tight">Access Terminal</h2>
        <p className="text-white/40 text-xs font-medium mt-1">Initialize administrative session</p>
      </div>

      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/30 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2.5 ml-1">Terminal ID (Email)</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-6 py-4 glass-input placeholder:text-white/10 text-sm font-medium"
              placeholder="admin@bezaw.tech"
              disabled={loading}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1">Security Key</label>
            <button
              type="button"
              onClick={onForgot}
              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest"
              disabled={loading}
            >
              Recover
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-12 py-4 glass-input placeholder:text-white/10 text-sm font-medium"
              placeholder="••••••••••••"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-primary py-4 text-sm tracking-[0.1em] uppercase group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>Processing...</>
        ) : (
          <>Authorize Entry <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 text-white/10">
        <Zap size={12} fill="currentColor" />
        <p className="text-[10px] font-bold uppercase tracking-widest">Quantum Encrypted</p>
      </div>
    </form>
  );
};

export default Login;

