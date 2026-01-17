
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageSquareQuote, Star, ThumbsUp, ThumbsDown,
  Search, Filter, Calendar, ShoppingBag,
  TrendingUp, MessageCircle, AlertCircle, Smile
} from 'lucide-react';

interface FeedbackEntry {
  id: string;
  order_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  created_at: string;
}

interface FeedbackProps {
  theme?: 'light' | 'dark';
}


const Feedback: React.FC<FeedbackProps> = ({ theme = 'dark' }) => {
  const isDark = theme === 'dark';
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [analytics, setAnalytics] = useState({ avgRating: '0.0', totalCount: 0, positiveRatio: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 5: return 'EXCELLENT';
      case 4: return 'VERY GOOD';
      case 3: return 'GOOD';
      case 2: return 'BAD';
      case 1: return 'WORST';
      default: return 'NEUTRAL';
    }
  };

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`http://superadminapi.ristestate.com/api/feedback?search=${searchTerm}&sentiment=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFeedback(response.data.data);
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFeedback();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Feedback Logs</h1>
          <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white' : 'text-gray-500'}`}>Sentiment Analysis // Platform Satisfaction</p>
        </div>
        <div className="flex gap-3">
          <div className={`glass-card px-5 py-2.5 rounded-xl flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-gray-950'}`}>
            <Calendar size={12} className="text-emerald-500" />
            Satisfaction Stream
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-8 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/5 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
              <TrendingUp size={16} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-400'}`}>Satisfaction Score</span>
          </div>
          <div className="flex items-end gap-3">
            <p className={`text-4xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>{analytics.avgRating}</p>
            <div className="flex gap-0.5 mb-1.5">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={12} fill={s <= Math.round(Number(analytics.avgRating)) ? "#10b981" : "transparent"} className={s <= Math.round(Number(analytics.avgRating)) ? "text-emerald-500" : "text-white"} />
              ))}
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/5 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              <MessageCircle size={16} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-400'}`}>Response Volume</span>
          </div>
          <p className={`text-4xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>{analytics.totalCount}</p>
        </div>

        <div className={`p-8 rounded-[2rem] border relative overflow-hidden group transition-all ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-black/5 shadow-lg'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
              <Smile size={16} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-400'}`}>Positive Ratio</span>
          </div>
          <p className={`text-4xl font-black font-poppins tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>
            {analytics.positiveRatio}%
          </p>
        </div>
      </div>

      <div className={`glass-card overflow-hidden ${isDark ? 'bg-white/[0.005]' : 'bg-white/20 border-black/5 shadow-none'}`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Filter feedback nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-12 pr-6 py-3 glass-input ${isDark ? 'text-white' : 'text-gray-950'} text-[11px] font-bold w-64 ${isDark ? '' : 'bg-white/10'}`}
              />
            </div>
            <div className="flex bg-black/10 rounded-xl p-1">
              {(['ALL', 'EXCELLENT', 'VERY GOOD', 'GOOD', 'BAD', 'WORST'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === mode ? 'bg-emerald-500 text-white' : `${isDark ? 'text-white' : 'text-gray-950'} hover:${isDark ? 'text-white' : 'text-emerald-500'}`}`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.005] text-white' : 'bg-gray-100/20 text-gray-400'}`}>
              <tr>
                <th className="px-10 py-6">Interaction Meta</th>
                <th className="px-10 py-6">Fiscal Rating</th>
                <th className="px-10 py-6">Commentary Manifest</th>

                <th className="px-10 py-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
              {feedback.map((fb) => (
                <tr key={fb.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                  <td className="px-10 py-7">
                    <div className="flex items-center space-x-5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-blue-400/40' : 'bg-blue-50 text-blue-600'}`}>
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{fb.customer_name || 'Anonymous'}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest text-emerald-500`}>{fb.order_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} size={10} fill={s <= fb.rating ? "#10b981" : "transparent"} className={s <= fb.rating ? "text-emerald-500" : "text-white"} />
                        ))}
                      </div>
                      <p className={`text-[8px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>{getRatingLabel(fb.rating)}</p>
                    </div>
                  </td>
                  <td className="px-10 py-7 max-w-md">
                    <p className={`text-xs font-medium leading-relaxed italic ${isDark ? 'text-white' : 'text-gray-950'}`}>"{fb.comment}"</p>
                  </td>

                  <td className={`px-10 py-7 text-right font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>
                    {new Date(fb.created_at).toLocaleDateString()} | {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={`p-8 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'border-white/5 text-white' : 'border-black/5 text-gray-400'}`}>
          <p>{feedback.length} Satisfaction Nodes Syncing</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
