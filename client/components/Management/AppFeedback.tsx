import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquareQuote, Search, Calendar, User, Hash, FileText
} from 'lucide-react';

interface AppFeedbackEntry {
    id: number;
    user_id: string;
    topic: string;
    comment: string;
    created_at: string;
}

interface AppFeedbackProps {
    theme?: 'light' | 'dark';
}

const AppFeedback: React.FC<AppFeedbackProps> = ({ theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const [feedback, setFeedback] = useState<AppFeedbackEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`https://superapi.bezawcurbside.com//api/app-feedback`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setFeedback(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching app feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const filteredFeedback = feedback.filter(fb =>
        fb.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.user_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>App Feedback</h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white' : 'text-gray-500'}`}>User Insights // Platform Improvements</p>
                </div>
                <div className="flex gap-3">
                    <div className={`glass-card px-5 py-2.5 rounded-xl flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-black/10 text-gray-950'}`}>
                        <Calendar size={12} className="text-emerald-500" />
                        Feedback Stream
                    </div>
                </div>
            </div>

            <div className={`glass-card overflow-hidden ${isDark ? 'bg-white/[0.005]' : 'bg-white/20 border-black/5 shadow-none'}`}>
                <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search feedback..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-12 pr-6 py-3 glass-input ${isDark ? 'text-white' : 'text-gray-950'} text-[11px] font-bold w-64 ${isDark ? '' : 'bg-white/10'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.005] text-white' : 'bg-gray-100/20 text-gray-400'}`}>
                            <tr>
                                <th className="px-10 py-6">User Details</th>
                                <th className="px-10 py-6">Topic</th>
                                <th className="px-10 py-6">Comment</th>
                                <th className="px-10 py-6 text-right">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                            {filteredFeedback.map((fb) => (
                                <tr key={fb.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center space-x-5">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5 text-blue-400/40' : 'bg-blue-50 text-blue-600'}`}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{fb.user_id || 'Anonymous'}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest text-emerald-500`}>ID: {fb.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center space-x-3">
                                            <Hash size={14} className={isDark ? 'text-white/50' : 'text-black/50'} />
                                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-gray-950'}`}>{fb.topic}</span>
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
                            {filteredFeedback.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={4} className="px-10 py-8 text-center opacity-50 text-[10px] uppercase tracking-widest">
                                        No feedback found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={`p-8 border-t flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.3em] ${isDark ? 'border-white/5 text-white' : 'border-black/5 text-gray-400'}`}>
                    <p>{filteredFeedback.length} Feedback Nodes Syncing</p>
                </div>
            </div>
        </div>
    );
};

export default AppFeedback;
