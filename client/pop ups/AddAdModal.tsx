import React, { useState } from 'react';
import { X, Save, Loader2, ImageIcon, Film, Clock, Type } from 'lucide-react';

interface AddAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    isDarkMode: boolean;
}

const AddAdModal: React.FC<AddAdModalProps> = ({ isOpen, onClose, onSuccess, isDarkMode }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');

    // Form State
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [duration, setDuration] = useState('24'); // Default 24 hours
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setMediaFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!mediaFile) throw new Error('Please select a media file');

            // 1. Upload Media
            const formData = new FormData();
            formData.append('image', mediaFile); // The upload endpoint expects 'image' field for both images and videos based on previous impl

            const token = localStorage.getItem('authToken');

            const uploadRes = await fetch('https://superapi.bezawcurbside.com/api/upload/image', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!uploadRes.ok) throw new Error('Failed to upload media');
            const uploadData = await uploadRes.json();
            const mediaUrl = uploadData.imageUrl; // The endpoint returns { imageUrl: ... } even for relative paths

            // 2. Create Ad
            const adRes = await fetch('https://superapi.bezawcurbside.com/api/ads/ads-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: activeTab,
                    media_url: mediaUrl,
                    description,
                    duration_hours: parseInt(duration)
                })
            });

            if (!adRes.ok) throw new Error('Failed to create ad');

            // Success
            if (onSuccess) {
                onSuccess();
            } else {
                onClose();
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className={`max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl transition-all border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-[#121418] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="px-8 pt-8 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                            <ImageIcon className="text-emerald-500" size={24} />
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>New Ad</h2>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">Promotional Content</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 transition-colors ${isDarkMode ? 'text-slate-600 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-8 flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                    <button
                        onClick={() => { setActiveTab('image'); setMediaFile(null); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'image'
                            ? 'text-emerald-500 border-emerald-500'
                            : 'text-slate-400 border-transparent hover:text-slate-500'}`}
                    >
                        Image Ad
                    </button>
                    <button
                        onClick={() => { setActiveTab('video'); setMediaFile(null); }}
                        className={`pb-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'video'
                            ? 'text-pink-500 border-pink-500'
                            : 'text-slate-400 border-transparent hover:text-slate-500'}`}
                    >
                        Video Ad
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                    <div className="space-y-4">

                        {/* Media Upload */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">
                                {activeTab === 'image' ? 'Image File' : 'Video File'}
                            </label>
                            <div className="relative">
                                <input
                                    required
                                    type="file"
                                    accept={activeTab === 'image' ? "image/*" : "video/*"}
                                    className="hidden"
                                    id="media-upload"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="media-upload"
                                    className={`w-full flex items-center justify-between px-6 py-8 rounded-xl border border-dashed transition-all cursor-pointer ${isDarkMode ? 'bg-[#0f1115] border-slate-800 hover:border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-emerald-500'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                                            {activeTab === 'image' ? <ImageIcon size={24} className="text-emerald-500" /> : <Film size={24} className="text-pink-500" />}
                                        </div>
                                        <div>
                                            <div className={`text-sm font-bold ${mediaFile ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-500'}`}>
                                                {mediaFile ? mediaFile.name : `Select ${activeTab} file...`}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">
                                                {activeTab === 'image' ? 'JPG, PNG, WEBP up to 5MB' : 'MP4, MOV up to 100MB'}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-500/10 px-3 py-1.5 rounded-lg">Browse</span>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Short Description</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="e.g. Summer Sale 50% Off"
                                    maxLength={50}
                                    className={`w-full pl-12 pr-4 py-4 rounded-xl border transition-all font-bold text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isDarkMode ? 'bg-[#0f1115] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="text-right text-[10px] text-slate-500 mt-1 font-mono">{description.length}/50</div>
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Duration</label>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: '24 Hours', value: '24' },
                                    { label: '3 Days', value: '72' },
                                    { label: '1 Week', value: '168' },
                                    { label: '30 Days', value: '720' },
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setDuration(opt.value)}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${duration === opt.value
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/30'
                                            : isDarkMode
                                                ? 'bg-[#0f1115] border-slate-800 text-slate-400 hover:border-slate-700'
                                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                                            }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm font-bold">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {loading ? 'Publishing...' : 'Publish Ad'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAdModal;
