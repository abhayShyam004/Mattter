import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Users,
    Sparkles,
    Heart,
    Scissors,
    User,
    Hand,
    Droplets,
    Shirt,
    Laptop,
    Edit2,
    X
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const PreferencesEditor = ({ onClose }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        consultation_type: [],
        service_scope: '',
        services_selected: [],
        budget_catalyst: '',
        budget_personal: ''
    });

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_BASE_URL}/api/profiles/get_preferences/`,
                {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                }
            );
            if (response.data.success) {
                setFormData(response.data.preferences);
            }
        } catch (err) {
            setError('Failed to load preferences. Please try again.');
            console.error('Error loading preferences:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConsultationTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            consultation_type: prev.consultation_type.includes(type)
                ? prev.consultation_type.filter(t => t !== type)
                : [...prev.consultation_type, type]
        }));
    };

    const handleServiceScopeChange = (scope) => {
        setFormData(prev => ({
            ...prev,
            service_scope: scope,
            // Auto-select all services for complete rebranding
            services_selected: scope === 'complete_rebranding'
                ? ['body_fitness', 'hair', 'skincare', 'nails', 'hygiene', 'wardrobe']
                : ['wardrobe']
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${API_BASE_URL}/api/profiles/update_preferences/`,
                formData,
                {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save preferences. Please try again.');
            console.error('Error saving preferences:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        fetchPreferences(); // Reset to saved preferences
    };

    const serviceIcons = {
        body_fitness: { label: 'Body & Fitness', icon: Heart },
        hair: { label: 'Hair Styling', icon: Scissors },
        skincare: { label: 'Skincare & Face', icon: Droplets },
        nails: { label: 'Nails & Grooming', icon: Hand },
        hygiene: { label: 'Hygiene', icon: User },
        wardrobe: { label: 'Wardrobe & Fashion', icon: Shirt },
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-center space-x-3 text-text-primary">
                        <div className="w-6 h-6 border-3 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
                        <span>Loading preferences...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative mx-auto bg-dark-surface border border-dark-border rounded-2xl p-4 md:p-8 w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-xl flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary">My Preferences</h2>
                            <p className="text-sm text-text-secondary">Your style journey settings</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-dark-elevated rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6 text-text-muted" />
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Content */}
                <div className="space-y-8">
                    {/* Consultation Type */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Consultation Preference</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div
                                onClick={isEditing ? () => handleConsultationTypeToggle('physical') : undefined}
                                className={`p-6 rounded-xl border-2 transition-all ${formData.consultation_type.includes('physical')
                                    ? 'bg-accent-purple/20 border-accent-purple'
                                    : 'bg-dark-elevated border-dark-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-accent-purple/50' : 'opacity-75'}`}
                            >
                                <Users className="w-10 h-10 text-accent-purple mb-3" />
                                <h4 className="text-lg font-bold text-text-primary mb-1">Physical (In-Person)</h4>
                                <p className="text-text-secondary text-sm">
                                    Meet your catalyst face-to-face
                                </p>
                            </div>

                            <div
                                onClick={isEditing ? () => handleConsultationTypeToggle('online') : undefined}
                                className={`p-6 rounded-xl border-2 transition-all ${formData.consultation_type.includes('online')
                                    ? 'bg-accent-blue/20 border-accent-blue'
                                    : 'bg-dark-elevated border-dark-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-accent-blue/50' : 'opacity-75'}`}
                            >
                                <Laptop className="w-10 h-10 text-accent-blue mb-3" />
                                <h4 className="text-lg font-bold text-text-primary mb-1">Online (Virtual)</h4>
                                <p className="text-text-secondary text-sm">
                                    Connect remotely via video calls
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Service Scope */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Transformation Type</h3>
                        <div className="space-y-4">
                            <div
                                onClick={isEditing ? () => handleServiceScopeChange('complete_rebranding') : undefined}
                                className={`p-6 rounded-xl border-2 transition-all ${formData.service_scope === 'complete_rebranding'
                                    ? 'bg-accent-pink/20 border-accent-pink'
                                    : 'bg-dark-elevated border-dark-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-accent-pink/50' : 'opacity-75'}`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-text-primary mb-2">Complete Rebranding</h4>
                                        <p className="text-text-secondary text-sm">
                                            Full transformation including physical aspects and wardrobe
                                        </p>
                                    </div>
                                    <Sparkles className="w-8 h-8 text-accent-pink" />
                                </div>

                                {formData.service_scope === 'complete_rebranding' && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-dark-border">
                                        {Object.entries(serviceIcons).map(([id, { label, icon: Icon }]) => (
                                            <div
                                                key={id}
                                                className="flex items-center space-x-2 p-2 rounded-lg bg-accent-purple/20 text-accent-purple/70 opacity-60 pointer-events-none select-none"
                                            >
                                                <Icon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={isEditing ? () => handleServiceScopeChange('wardrobe_only') : undefined}
                                className={`p-6 rounded-xl border-2 transition-all ${formData.service_scope === 'wardrobe_only'
                                    ? 'bg-accent-gold/20 border-accent-gold'
                                    : 'bg-dark-elevated border-dark-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-accent-gold/50' : 'opacity-75'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-xl font-bold text-text-primary mb-2">Wardrobe & Fashion Only</h4>
                                        <p className="text-text-secondary text-sm">
                                            Focus on clothing, shoes, and accessories styling
                                        </p>
                                    </div>
                                    <Shirt className="w-8 h-8 text-accent-gold" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Budget Preferences</h3>

                        {/* Catalyst Budget */}
                        <div className="mb-6">
                            <h4 className="text-md font-medium text-text-primary mb-3">Budget for Catalyst Fees</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['free', '200-500', '500-1000', '1000-2000', '2000-5000', '5000+'].map((range) => (
                                    <button
                                        key={range}
                                        type="button"
                                        disabled={!isEditing}
                                        onClick={() => setFormData(prev => ({ ...prev, budget_catalyst: range }))}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.budget_catalyst === range
                                            ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                                            : 'bg-dark-elevated border-dark-border text-text-secondary'
                                            } ${isEditing ? 'hover:border-accent-purple/50 cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        <div className="font-semibold">
                                            {range === 'free' ? 'Free' : `₹${range}`}
                                        </div>
                                        {range === 'free' && (
                                            <div className="text-xs mt-1 opacity-75">Pro-bono</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Personal Budget */}
                        <div>
                            <h4 className="text-md font-medium text-text-primary mb-3">Budget for Personal Transformation</h4>
                            <p className="text-sm text-text-muted mb-3">Products, services, and lifestyle changes</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['200-1000', '1000-3000', '3000-5000', '5000-10000', '10000+'].map((range) => (
                                    <button
                                        key={range}
                                        type="button"
                                        disabled={!isEditing}
                                        onClick={() => setFormData(prev => ({ ...prev, budget_personal: range }))}
                                        className={`p-4 rounded-lg border-2 transition-all ${formData.budget_personal === range
                                            ? 'bg-accent-pink/20 border-accent-pink text-accent-pink'
                                            : 'bg-dark-elevated border-dark-border text-text-secondary'
                                            } ${isEditing ? 'hover:border-accent-pink/50 cursor-pointer' : 'opacity-75 cursor-not-allowed'}`}
                                    >
                                        <div className="font-semibold">₹{range}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                    <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-dark-border">
                        <button
                            onClick={handleCancel}
                            disabled={saving}
                            className="px-6 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary hover:bg-dark-surface transition-all disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PreferencesEditor;
