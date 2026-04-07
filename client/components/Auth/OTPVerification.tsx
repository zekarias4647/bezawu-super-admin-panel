
import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, RefreshCcw, ArrowLeft, AlertCircle } from 'lucide-react';

interface OTPProps {
  email: string;
  onVerified: (resetToken: string) => void;
  onBack: () => void;
}

const OTPVerification: React.FC<OTPProps> = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.value !== "" && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (otpCode: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://superapi.bezawcurbside.com/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified(data.resetToken);
      } else {
        setError(data.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (err) {
      setError('Unable to verify OTP. Please try again.');
      console.error('OTP verification error:', err);
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (otp.every(v => v !== '')) {
      const otpCode = otp.join('');
      verifyOTP(otpCode);
    }
  }, [otp]);

  const handleResend = async () => {
    setError('');
    try {
      const response = await fetch('https://superapi.bezawcurbside.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(600);
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
      }
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="absolute top-0 left-0 p-2 text-white/30 hover:text-white transition-all">
        <ArrowLeft size={20} />
      </button>

      <div className="text-center mb-10 mt-2">
        <div className="w-16 h-16 glass-card flex items-center justify-center mx-auto mb-6 relative group overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-all"></div>
          <Fingerprint className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white font-poppins">Validation</h2>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
          Enter Cryptographic Sequence
        </p>
        <p className="text-white/30 text-xs mt-2">
          Code sent to {email}
        </p>
      </div>

      {error && (
        <div className="glass-card bg-red-500/10 border-red-500/30 p-4 flex items-center gap-3 mb-6">
          <AlertCircle className="text-red-400" size={20} />
          <p className="text-red-400 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="flex justify-center gap-3 mb-10">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            className="w-12 h-16 glass-input text-center text-xl font-bold text-emerald-400"
            value={data}
            onChange={e => handleChange(e.target, index)}
            onKeyDown={e => handleKeyDown(e, index)}
            onFocus={e => e.target.select()}
            disabled={loading}
            ref={el => { inputs.current[index] = el; }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6">
        <button
          onClick={handleResend}
          disabled={timeLeft > 0}
          className="flex items-center gap-2 text-[10px] font-bold text-white/20 hover:text-white transition-colors uppercase tracking-[0.2em] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RefreshCcw size={14} />
          {timeLeft > 0 ? `Resend in ${formatTime(timeLeft)}` : 'Resend Code'}
        </button>

        <div className="w-full p-4 glass-card bg-white/5 border-white/10 flex items-center gap-4">
          <p className="text-[10px] font-bold text-white/20 text-center w-full uppercase tracking-widest">
            {loading ? 'Verifying...' : 'Terminal Auth Pending...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;

