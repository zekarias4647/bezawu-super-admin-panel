import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
    Briefcase, Plus, Search, Edit, Trash2, X,
    Save, FileJson, MinusCircle, GripVertical
} from 'lucide-react';

interface BusinessTypesProps {
    theme?: 'light' | 'dark';
}

interface BusinessType {
    id: string;
    name: string;
    description: string;
    config: any;
}

interface FieldDef {
    name: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
}

const BusinessTypes: React.FC<BusinessTypesProps> = ({ theme = 'dark' }) => {
    const isDark = theme === 'dark';
    const [businessTypes, setBusinessTypes] = useState<BusinessType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<BusinessType | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [fields, setFields] = useState<FieldDef[]>([]);

    const fetchBusinessTypes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get('https://superapi.bezawcurbside.com/api/business-types', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setBusinessTypes(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching business types:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBusinessTypes();
    }, []);

    const handleOpenModal = (type?: BusinessType) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name,
                description: type.description || ''
            });

            // Parse config to extract fields
            if (type.config && Array.isArray(type.config.fields)) {
                setFields(type.config.fields);
            } else {
                setFields([]);
            }
        } else {
            setEditingType(null);
            setFormData({
                name: '',
                description: ''
            });
            setFields([
                { name: 'example_field', label: 'Example Field', type: 'text', required: true }
            ]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingType(null);
    };

    const addField = () => {
        setFields([...fields, { name: '', label: '', type: 'text', required: false }]);
    };

    const updateField = (index: number, key: keyof FieldDef, value: any) => {
        const newFields = [...fields];
        // @ts-ignore
        newFields[index][key] = value;
        setFields(newFields);
    };

    const addOption = (index: number) => {
        const newFields = [...fields];
        if (!newFields[index].options) {
            newFields[index].options = [];
        }
        newFields[index].options!.push('');
        setFields(newFields);
    };

    const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
        const newFields = [...fields];
        if (newFields[fieldIndex].options) {
            newFields[fieldIndex].options![optionIndex] = value;
            setFields(newFields);
        }
    };

    const removeOption = (fieldIndex: number, optionIndex: number) => {
        const newFields = [...fields];
        if (newFields[fieldIndex].options) {
            newFields[fieldIndex].options!.splice(optionIndex, 1);
            setFields(newFields);
        }
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const handleSave = async () => {
        try {
            // Construct JSON from fields
            const config = {
                fields: fields
            };

            const token = localStorage.getItem('authToken');
            const payload = {
                name: formData.name,
                description: formData.description,
                config: config
            };

            if (editingType) {
                await axios.put(`https://superapi.bezawcurbside.com/api/business-types/${editingType.id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('https://superapi.bezawcurbside.com/api/business-types', payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            fetchBusinessTypes();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving business type:', error);
            alert('Failed to save business type');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this business type?')) return;

        try {
            const token = localStorage.getItem('authToken');
            await axios.delete(`https://superapi.bezawcurbside.com/api/business-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchBusinessTypes();
        } catch (error) {
            console.error('Error deleting business type:', error);
            alert('Failed to delete business type');
        }
    };

    const filteredTypes = businessTypes.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modalContent = isModalOpen ? (
        <div className="fixed inset-0 w-screen h-screen z-[99999] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            <div
                className={`absolute inset-0 transition-all duration-1000 backdrop-blur-[120px] ${isDark ? 'bg-slate-950/40' : 'bg-white/30'}`}
                onClick={handleCloseModal}
            ></div>

            <div className={`relative w-full max-w-5xl glass-card overflow-hidden shadow-[0_0_150px_rgba(0,0,0,0.5)] border transition-all duration-500 flex flex-col max-h-[96vh] ${isDark ? 'bg-[#020617]/60 border-white/10' : 'bg-white/60 border-black/5'}`}>
                <div className={`p-8 border-b flex justify-between items-center ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-gray-50/10'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                            {editingType ? <Edit size={24} /> : <Plus size={24} />}
                        </div>
                        <div>
                            <h2 className={`text-2xl font-black font-poppins uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-950'}`}>
                                {editingType ? 'Edit Configuration' : 'New Business Type'}
                            </h2>
                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                                Define schema parameters
                            </p>
                        </div>
                    </div>
                    <button onClick={handleCloseModal} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-white' : 'hover:bg-black/5 text-gray-400 hover:text-black'}`}>
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Type Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Grocery Store"
                                className={`w-full px-4 py-3 rounded-xl border bg-transparent font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'border-white/10 text-white placeholder:text-white/10' : 'border-black/10 text-gray-950 placeholder:text-black/20'}`}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description..."
                                className={`w-full px-4 py-3 rounded-xl border bg-transparent font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${isDark ? 'border-white/10 text-white placeholder:text-white/10' : 'border-black/10 text-gray-950 placeholder:text-black/20'}`}
                            />
                        </div>
                    </div>

                    {/* Field Builder */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Form Fields Definition</label>
                            <button
                                onClick={addField}
                                className={`px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all`}
                            >
                                + Add Field
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Header Row */}
                            <div className={`grid grid-cols-12 gap-4 px-4 py-2 ${isDark ? 'text-white/20' : 'text-gray-400'} text-[9px] font-black uppercase tracking-widest`}>
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-3">Label</div>
                                <div className="col-span-3">Key Name</div>
                                <div className="col-span-2">Type</div>
                                <div className="col-span-2 text-center">Required</div>
                                <div className="col-span-1 text-right">Action</div>
                            </div>

                            {fields.map((field, index) => (
                                <div key={index} className={`p-3 rounded-xl border transition-all group ${isDark ? 'bg-white/[0.02] border-white/5 hover:border-white/10' : 'bg-white border-black/5 hover:border-black/10'}`}>
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        <div className="col-span-1 flex justify-center text-white/20 cursor-move">
                                            <GripVertical size={14} />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                value={field.label}
                                                onChange={(e) => updateField(index, 'label', e.target.value)}
                                                placeholder="Display Label"
                                                className={`w-full bg-transparent outline-none font-bold text-xs ${isDark ? 'text-white placeholder:text-white/10' : 'text-gray-900 placeholder:text-gray-400'}`}
                                            />
                                        </div>
                                        <div className="col-span-3">
                                            <input
                                                type="text"
                                                value={field.name}
                                                onChange={(e) => updateField(index, 'name', e.target.value)}
                                                placeholder="fieldName"
                                                className={`w-full bg-transparent outline-none font-mono text-xs ${isDark ? 'text-emerald-400 placeholder:text-white/10' : 'text-emerald-700 placeholder:text-gray-400'}`}
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <select
                                                value={field.type}
                                                onChange={(e) => updateField(index, 'type', e.target.value)}
                                                className={`w-full bg-transparent outline-none font-bold text-xs cursor-pointer ${isDark ? 'text-white' : 'text-gray-900'} [&>option]:bg-gray-900`}
                                            >
                                                <option value="text">Text</option>
                                                <option value="number">Number</option>
                                                <option value="textarea">Long Text</option>
                                                <option value="boolean">Boolean</option>
                                                <option value="dropdown">Dropdown</option>
                                                <option value="checkbox">Checkbox</option>
                                                <option value="select">Select</option>
                                                <option value="date">Date</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <input
                                                type="checkbox"
                                                checked={field.required}
                                                onChange={(e) => updateField(index, 'required', e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-500 accent-emerald-500 cursor-pointer"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                onClick={() => removeField(index)}
                                                className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/20 hover:text-rose-400 hover:bg-rose-500/10' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'}`}
                                            >
                                                <MinusCircle size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Options Editor */}
                                    {['dropdown', 'checkbox', 'select'].includes(field.type) && (
                                        <div className={`mt-4 ml-12 p-4 rounded-xl border border-dashed animate-in slide-in-from-top-2 duration-300 ${isDark ? 'border-white/10 bg-black/20' : 'border-black/10 bg-gray-50'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1 h-3 rounded-full bg-emerald-500"></div>
                                                    <label className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Options Configuration</label>
                                                </div>
                                                <button
                                                    onClick={() => addOption(index)}
                                                    className={`px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1.5`}
                                                >
                                                    <Plus size={10} /> Add Option
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {field.options?.map((opt, optIndex) => (
                                                    <div key={optIndex} className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${isDark ? 'bg-white/[0.03] border-white/5 focus-within:border-emerald-500/30' : 'bg-white border-black/5 focus-within:border-emerald-500/30'}`}>
                                                        <input
                                                            type="text"
                                                            value={opt}
                                                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                                                            placeholder={`e.g. Option ${optIndex + 1}`}
                                                            className={`flex-1 bg-transparent outline-none font-bold text-[11px] ${isDark ? 'text-white placeholder:text-white/10' : 'text-gray-900 placeholder:text-gray-300'}`}
                                                        />
                                                        <button
                                                            onClick={() => removeOption(index, optIndex)}
                                                            className={`p-1 rounded-md transition-all ${isDark ? 'text-white/20 hover:text-rose-400 hover:bg-rose-500/10' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-50'}`}
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {(!field.options || field.options.length === 0) && (
                                                    <div className={`col-span-full py-2 flex items-center justify-center ${isDark ? 'text-white/10' : 'text-gray-300'}`}>
                                                        <p className="text-[10px] font-bold uppercase tracking-widest italic">No options defined - forms will be empty</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {fields.length === 0 && (
                                <div className={`p-8 rounded-xl border border-dashed flex flex-col items-center justify-center gap-2 ${isDark ? 'border-white/10 text-white/20' : 'border-black/10 text-gray-400'}`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest">No fields defined</p>
                                    <button onClick={addField} className="text-emerald-500 text-xs hover:underline">Add First Field</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={`p-6 border-t flex justify-end gap-4 ${isDark ? 'border-white/5 bg-black/20' : 'border-black/5 bg-gray-50'}`}>
                    <button
                        onClick={handleCloseModal}
                        className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isDark ? 'border-white/10 text-white/40 hover:text-white hover:bg-white/5' : 'border-black/10 text-gray-400 hover:text-black hover:bg-white'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        <Save size={16} />
                        <span>Save Schema</span>
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Loading Schemas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className={`text-4xl font-black font-poppins tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-950'}`}>Business Types</h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.4em] mt-1 ${isDark ? 'text-white/30' : 'text-gray-500'}`}>Form Configuration & Data Schemas</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-all group"
                >
                    <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Create New Type</span>
                </button>
            </div>

            <div className={`glass-card shadow-2xl overflow-hidden border-0 ${isDark ? 'bg-white/[0.005]' : 'bg-white/40 border-black/5 shadow-none'}`}>
                <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            <span className={`text-[9px] font-black uppercase tracking-[0.4em] ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{businessTypes.length} Types Definitions</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/20' : 'text-gray-400'}`} />
                            <input
                                type="text"
                                placeholder="Search types..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`pl-12 pr-6 py-3 glass-input text-[11px] font-bold w-64 ${isDark ? '' : 'bg-white/60 border-black/10'}`}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className={`text-[9px] uppercase font-black tracking-[0.3em] ${isDark ? 'bg-white/[0.02] text-white/20' : 'bg-gray-100/50 text-gray-400'}`}>
                            <tr>
                                <th className="px-10 py-6">Identity</th>
                                <th className="px-10 py-6">Description</th>
                                <th className="px-10 py-6">Config Schema</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y text-xs ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                            {filteredTypes.map((type) => (
                                <tr key={type.id} className={`transition-all group ${isDark ? 'hover:bg-white/[0.01]' : 'hover:bg-white/30'}`}>
                                    <td className="px-10 py-7">
                                        <div className="flex items-center space-x-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-all duration-500 ${isDark ? 'bg-white/5 text-purple-400' : 'bg-white text-purple-600 border border-black/5 shadow-sm'}`}>
                                                <Briefcase size={22} />
                                            </div>
                                            <div>
                                                <p className={`text-sm font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-gray-950'}`}>{type.name}</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>{type.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`px-10 py-7 font-medium ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                        {type.description || <span className="opacity-20">-</span>}
                                    </td>
                                    <td className="px-10 py-7">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/5 text-black/40'}`}>
                                            <FileJson size={10} />
                                            {Array.isArray(type.config.fields) ? `${type.config.fields.length} Fields` : 'Custom JSON'}
                                        </div>
                                    </td>
                                    <td className="px-10 py-7 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => handleOpenModal(type)}
                                                className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/20' : 'bg-white border border-black/5 text-gray-400 hover:text-emerald-600 hover:border-emerald-200'}`}
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id)}
                                                className={`p-3 rounded-xl transition-all ${isDark ? 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-white/20' : 'bg-white border border-black/5 text-gray-400 hover:text-rose-600 hover:border-rose-200'}`}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredTypes.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-10 py-10 text-center">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white/20' : 'text-gray-400'}`}>No Business Types Found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {createPortal(modalContent, document.body)}
        </div>
    );
};

export default BusinessTypes;
