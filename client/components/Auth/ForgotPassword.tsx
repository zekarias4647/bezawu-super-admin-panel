
import React, { useState } from 'react';
import { ArrowLeft, Send, Cpu, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  onNext: (email: string) => void;
  onBack: () => void;
}

const ForgotPassword: React.FC<Props> = ({ onNext, onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('http://superadminapi.ristestate.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Wait a moment to show success message, then proceed
        setTimeout(() => {
          onNext(email);
        }, 1500);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="absolute top-0 left-0 p-2 text-white/30 hover:text-white transition-all">
        <ArrowLeft size={20} />
      </button>

      <div className="text-center mb-10 mt-2">
        <div className="w-16 h-16 glass-card flex items-center justify-center mx-auto mb-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-500/10 group-hover:bg-blue-500/20 transition-all"></div>
          <Cpu className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-white font-poppins">Identity Check</h2>
        <p className="text-white/40 text-xs font-medium mt-2 px-4 leading-relaxed">
          Specify terminal identifier to initiate cryptographic recovery sequence.
        </p>
      </div>

      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/30 p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="glass-card bg-emerald-500/10 border-emerald-500/30 p-4 flex items-center gap-3 mb-6">
          <CheckCircle className="text-emerald-400" size={20} />
          <p className="text-emerald-400 text-sm font-medium">OTP sent successfully! Redirecting...</p>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 ml-1">Terminal Identifier</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-6 py-4 glass-input text-sm font-medium"
            placeholder="admin@bezaw.tech"
            disabled={loading || success}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || success}
          className="w-full btn-primary py-4 text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>Processing...</>
          ) : success ? (
            <>Sent! <CheckCircle size={18} /></>
          ) : (
            <>Request Sequence <Send size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
