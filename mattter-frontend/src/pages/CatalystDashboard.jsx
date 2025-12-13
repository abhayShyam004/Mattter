import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Heart, Calendar, Image, X, Plus, Check, Clock, Sparkles, XCircle, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../config';
const CatalystDashboard = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [matchedSeekers, setMatchedSeekers] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [seekerToRemove, setSeekerToRemove] = useState(null);
    const [selectedMatchedSeeker, setSelectedMatchedSeeker] = useState(null);
    const [showMatchedSeekerModal, setShowMatchedSeekerModal] = useState(false);
    const [isViewing, setIsViewing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        is_active: true,
        bio_short: '',
        bio: '',
        specializations: [],
        portfolio_images: [],
        hourly_rate: '',
        address: '',
        latitude: '',
        longitude: ''
    });

    const [newSpecialization, setNewSpecialization] = useState('');
    const [newImageUrl, setNewImageUrl] = useState('');

    // Available specialization options
    const specializationOptions = [
        'Personal Styling', 'Wardrobe Consulting', 'Contemporary Fashion',
        'Saree Styling', 'Fusion Wear',
        'Beach Fashion', 'Office Wear', 'Tropical Styling',
        'Sustainable Fashion', 'Local Textiles', 'Wardrobe Curation',
        'Luxury Fashion', 'Personal Branding', 'Event Styling',
        'Wedding Styling', 'Casual Wear', 'Formal Wear'
    ];

    useEffect(() => {
        fetchProfile();
        fetchIncomingRequests();
        fetchMatchedSeekers();
        detectLocation();
    }, []);

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }));
                    console.log('Location detected:', position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.log('Location detection failed, using defaults:', error.message);
                }
            );
        }
    };

    const fetchProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            console.log('Fetched profile data:', data);
            setProfile(data);

            // Populate form with existing data, ensuring proper defaults
            setFormData({
                is_active: data.is_active !== undefined ? data.is_active : true,
                bio_short: data.bio_short || '',
                bio: data.bio || '',
                specializations: Array.isArray(data.specializations) ? data.specializations : [],
                portfolio_images: Array.isArray(data.portfolio_images) ? data.portfolio_images : [],
                hourly_rate: data.hourly_rate ? String(data.hourly_rate) : '',
                address: data.address || '',
                latitude: data.latitude || '',
                longitude: data.longitude || ''
            });
            console.log('Form populated with:', {
                bio_short: data.bio_short,
                bio: data.bio,
                specializations: data.specializations,
                portfolio_count: data.portfolio_images?.length || 0
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchIncomingRequests = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/?status=REQUESTED`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setIncomingRequests(data.results || data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        }
    };

    const fetchMatchedSeekers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/?status=CONFIRMED,COMPLETED`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setMatchedSeekers(data.results || data || []);
        } catch (error) {
            console.error('Error fetching matched seekers:', error);
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);

        // Prepare data for saving - remove empty lat/lon to avoid validation errors
        const dataToSave = {
            is_active: formData.is_active,
            bio_short: formData.bio_short,
            bio: formData.bio,
            specializations: formData.specializations,
            portfolio_images: formData.portfolio_images,
            hourly_rate: formData.hourly_rate || null,
            address: formData.address
        };

        // Only include lat/lon if they have valid numeric values
        if (formData.latitude && !isNaN(formData.latitude)) {
            dataToSave.latitude = parseFloat(formData.latitude);
        }
        if (formData.longitude && !isNaN(formData.longitude)) {
            dataToSave.longitude = parseFloat(formData.longitude);
        }

        console.log('Saving profile with data:', dataToSave);
        try {
            const response = await fetch(`${API_BASE_URL}/api/profiles/me/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSave)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok) {
                setProfile(data);
                setFormData({
                    ...formData,
                    ...data
                });

                // Show success state using React state
                setSaving(false);
                setSaved(true);

                // Reset saved state after 2 seconds
                setTimeout(() => {
                    setSaved(false);
                }, 2000);
            } else {
                console.error('Save failed:', data);
                alert(`Failed to save profile: ${JSON.stringify(data)}`);
                setSaving(false);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile: ' + error.message);
            setSaving(false);
        }
    };

    const addSpecialization = (spec) => {
        if (spec && !formData.specializations.includes(spec)) {
            setFormData({
                ...formData,
                specializations: [...formData.specializations, spec]
            });
            setNewSpecialization('');
        }
    };

    const removeSpecialization = (spec) => {
        setFormData({
            ...formData,
            specializations: formData.specializations.filter(s => s !== spec)
        });
    };

    const addPortfolioImage = () => {
        if (newImageUrl && formData.portfolio_images.length < 5) {
            setFormData({
                ...formData,
                portfolio_images: [...formData.portfolio_images, newImageUrl]
            });
            setNewImageUrl('');
        }
    };

    const removePortfolioImage = (index) => {
        setFormData({
            ...formData,
            portfolio_images: formData.portfolio_images.filter((_, i) => i !== index)
        });
    };

    const toggleActive = async () => {
        const newActiveState = !formData.is_active;
        setFormData({ ...formData, is_active: newActiveState });

        try {
            await fetch(`${API_BASE_URL}/api/profiles/me/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: newActiveState })
            });
        } catch (error) {
            console.error('Error toggling active status:', error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${requestId}/accept_request/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh requests and matched seekers
                await fetchIncomingRequests();
                await fetchMatchedSeekers();
                setShowRequestModal(false);
                setSelectedRequest(null);
            } else {
                const data = await response.json();
                alert(`Failed to accept request: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request: ' + error.message);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${requestId}/reject_request/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh requests
                await fetchIncomingRequests();
                await fetchMatchedSeekers();
                setShowRequestModal(false);
                setSelectedRequest(null);
            } else {
                const data = await response.json();
                alert(`Failed to reject request: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request: ' + error.message);
        }
    };

    const handleRemoveSeeker = async () => {
        if (!seekerToRemove) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/bookings/${seekerToRemove.id}/delete_booking/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                // Refresh the matched seekers list
                await fetchMatchedSeekers();
                setShowRemoveConfirm(false);
                setSeekerToRemove(null);
            } else {
                const data = await response.json();
                alert(`Failed to remove seeker: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error removing seeker:', error);
            alert('Failed to remove seeker: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const profileCompletionPercentage = () => {
        let completed = 0;
        const total = 6;
        if (formData.bio_short) completed++;
        if (formData.bio) completed++;
        if (formData.specializations.length > 0) completed++;
        if (formData.portfolio_images.length > 0) completed++;
        if (formData.hourly_rate) completed++;
        if (formData.address) completed++;
        return Math.round((completed / total) * 100);
    };

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="relative bg-gradient-to-br from-dark-elevated to-dark-surface border border-dark-border rounded-3xl p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                                    Catalyst Dashboard
                                </h1>
                                <Sparkles className="w-8 h-8 text-accent-gold" />
                            </div>
                            <p className="text-text-secondary text-lg">Welcome back, {profile?.user?.first_name || profile?.user?.username}!</p>

                            {/* Profile Completion */}
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-text-secondary">Profile Completion</span>
                                    <span className="text-sm font-semibold text-accent-purple">{profileCompletionPercentage()}%</span>
                                </div>
                                <div className="w-full bg-dark-surface rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-accent-purple to-accent-pink h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${profileCompletionPercentage()}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Active/Inactive Toggle */}
                        <div className="flex flex-col items-end gap-4">
                            <button
                                onClick={toggleActive}
                                className={`relative inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${formData.is_active
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-500/50'
                                    : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-lg hover:shadow-gray-500/50'
                                    }`}
                            >
                                <div className={`w-3 h-3 rounded-full ${formData.is_active ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
                                {formData.is_active ? 'Active - Accepting Requests' : 'Inactive - Not Accepting'}
                            </button>

                            {/* Quick Stats */}
                            <div className="flex gap-4">
                                <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl px-4 py-2">
                                    <div className="text-2xl font-bold text-accent-purple">{incomingRequests.length}</div>
                                    <div className="text-xs text-text-secondary">Requests</div>
                                </div>
                                <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl px-4 py-2">
                                    <div className="text-2xl font-bold text-accent-pink">{matchedSeekers.length}</div>
                                    <div className="text-xs text-text-secondary">Matches</div>
                                </div>
                                <div className="bg-dark-surface/50 backdrop-blur-sm border border-dark-border rounded-xl px-4 py-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <div className="text-2xl font-bold text-accent-gold">
                                            {profile?.average_rating ? parseFloat(profile.average_rating).toFixed(1) : '0.0'}
                                        </div>
                                    </div>
                                    <div className="text-xs text-text-secondary">
                                        {profile?.rating_count || 0} {profile?.rating_count === 1 ? 'Review' : 'Reviews'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Management Card */}
                <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <User className="w-6 h-6 text-accent-purple" />
                            Profile Management
                        </h2>
                        {!isViewing && !isEditing && (
                            <button
                                onClick={() => setIsViewing(true)}
                                className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl hover:shadow-lg hover:shadow-accent-purple/50 transition-all font-semibold"
                            >
                                View Details
                            </button>
                        )}
                        {isViewing && !isEditing && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setIsViewing(false);
                                        setIsEditing(false);
                                    }}
                                    className="px-6 py-3 bg-dark-elevated hover:bg-dark-border rounded-xl font-semibold transition-all"
                                >
                                    Collapse
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl hover:shadow-lg hover:shadow-accent-purple/50 transition-all font-semibold"
                                >
                                    Edit Details
                                </button>
                            </div>
                        )}
                    </div>

                    {!isViewing && !isEditing ? (
                        /* Fully collapsed view - show nothing */
                        <div className="text-center py-8">
                            <p className="text-text-secondary text-sm">Click "View Details" to see your profile information</p>
                        </div>
                    ) : isViewing && !isEditing ? (
                        /* Read-only view */
                        <div className="space-y-6">
                            {/* Short Bio - Read Only */}
                            {formData.bio_short && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">Short Bio / Tagline</label>
                                    <p className="text-text-primary bg-dark-elevated border border-dark-border rounded-xl px-4 py-3">
                                        {formData.bio_short}
                                    </p>
                                </div>
                            )}

                            {/* Detailed Bio - Read Only */}
                            {formData.bio && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">Detailed Bio</label>
                                    <p className="text-text-primary bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 whitespace-pre-wrap">
                                        {formData.bio}
                                    </p>
                                </div>
                            )}

                            {/* Specializations - Read Only */}
                            {formData.specializations.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">Expertise / Specializations</label>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.specializations.map((spec, index) => (
                                            <div
                                                key={index}
                                                className="bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border border-accent-purple/30 rounded-lg px-4 py-2"
                                            >
                                                <span className="text-sm font-medium">{spec}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Portfolio Images - Read Only */}
                            {formData.portfolio_images.length > 0 && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                                        Portfolio Images ({formData.portfolio_images.length})
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {formData.portfolio_images.map((url, index) => (
                                            <div key={index} className="relative aspect-square">
                                                <img
                                                    src={url}
                                                    alt={`Portfolio ${index + 1}`}
                                                    className="w-full h-full object-cover rounded-xl border border-dark-border"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Service Fee & Address - Read Only */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {formData.hourly_rate && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-text-secondary">Service Fee per Seeker</label>
                                        <p className="text-text-primary bg-dark-elevated border border-dark-border rounded-xl px-4 py-3">
                                            ₹{formData.hourly_rate}
                                        </p>
                                    </div>
                                )}
                                {formData.address && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-text-secondary">
                                            <MapPin className="w-4 h-4 inline mr-1" />
                                            Address
                                        </label>
                                        <p className="text-text-primary bg-dark-elevated border border-dark-border rounded-xl px-4 py-3">
                                            {formData.address}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Show message if profile is empty */}
                            {!formData.bio_short && !formData.bio && formData.specializations.length === 0 &&
                                formData.portfolio_images.length === 0 && !formData.hourly_rate && !formData.address && (
                                    <div className="text-center py-12">
                                        <User className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                                        <p className="text-text-secondary text-lg">Your profile is empty</p>
                                        <p className="text-text-secondary/60 text-sm mt-2">Click "Edit Details" to add your information</p>
                                    </div>
                                )}
                        </div>
                    ) : (
                        /* Edit mode - Full form */
                        <div className="space-y-6">
                            {/* Short Bio */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Short Bio / Tagline</label>
                                <input
                                    type="text"
                                    maxLength={200}
                                    value={formData.bio_short}
                                    onChange={(e) => setFormData({ ...formData, bio_short: e.target.value })}
                                    placeholder="e.g., Award-winning stylist with 10+ years experience"
                                    className="w-full bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                                />
                                <p className="text-xs text-text-secondary mt-1">{formData.bio_short.length}/200 characters</p>
                            </div>

                            {/* Detailed Bio */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Detailed Bio</label>
                                <textarea
                                    rows={6}
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell seekers about your experience, approach, and what makes you unique..."
                                    className="w-full bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all resize-none"
                                />
                            </div>

                            {/* Specializations */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">Expertise / Specializations</label>
                                <div className="flex gap-2 mb-3">
                                    <select
                                        value={newSpecialization}
                                        onChange={(e) => setNewSpecialization(e.target.value)}
                                        className="flex-1 bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-text-primary focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                                    >
                                        <option value="">Select a specialization...</option>
                                        {specializationOptions.map(spec => (
                                            <option key={spec} value={spec} disabled={formData.specializations.includes(spec)}>
                                                {spec}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => addSpecialization(newSpecialization)}
                                        disabled={!newSpecialization || formData.specializations.includes(newSpecialization)}
                                        className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl hover:shadow-lg hover:shadow-accent-purple/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {formData.specializations.map((spec, index) => (
                                        <div
                                            key={index}
                                            className="group relative bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border border-accent-purple/30 rounded-lg px-4 py-2 flex items-center gap-2"
                                        >
                                            <span className="text-sm font-medium">{spec}</span>
                                            <button
                                                onClick={() => removeSpecialization(spec)}
                                                className="p-1 hover:bg-red-500/20 rounded transition-all"
                                            >
                                                <X className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Portfolio Images */}
                            <div>
                                <label className="block text-sm font-medium mb-2 text-text-secondary">
                                    Portfolio Images ({formData.portfolio_images.length}/5)
                                </label>

                                {formData.portfolio_images.length < 5 && (
                                    <div className="mb-4">
                                        <label className="cursor-pointer">
                                            <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl hover:shadow-lg hover:shadow-accent-purple/50 transition-all">
                                                <Image className="w-5 h-5" />
                                                <span>Choose Image from Device</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file && formData.portfolio_images.length < 5) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setFormData({
                                                                ...formData,
                                                                portfolio_images: [...formData.portfolio_images, reader.result]
                                                            });
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                    e.target.value = ''; // Reset input
                                                }}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {formData.portfolio_images.map((url, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img
                                                src={url}
                                                alt={`Portfolio ${index + 1}`}
                                                className="w-full h-full object-cover rounded-xl border border-dark-border"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                                                }}
                                            />
                                            <button
                                                onClick={() => removePortfolioImage(index)}
                                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Service Fee & Address */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">Service Fee per Seeker (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.hourly_rate}
                                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                        placeholder="500"
                                        className="w-full bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-text-secondary">
                                        <MapPin className="w-4 h-4 inline mr-1" />
                                        Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Kochi, Kerala"
                                        className="w-full bg-dark-elevated border border-dark-border rounded-xl px-4 py-3 text-text-primary placeholder-text-secondary/50 focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4 justify-end pt-4">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form to original profile data
                                        setFormData({
                                            is_active: profile.is_active !== undefined ? profile.is_active : true,
                                            bio_short: profile.bio_short || '',
                                            bio: profile.bio || '',
                                            specializations: Array.isArray(profile.specializations) ? profile.specializations : [],
                                            portfolio_images: Array.isArray(profile.portfolio_images) ? profile.portfolio_images : [],
                                            hourly_rate: profile.hourly_rate ? String(profile.hourly_rate) : '',
                                            address: profile.address || '',
                                            latitude: profile.latitude || '',
                                            longitude: profile.longitude || ''
                                        });
                                    }}
                                    className="px-6 py-3 bg-dark-elevated hover:bg-dark-border rounded-xl font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        await handleSaveProfile();
                                        if (!saving) {
                                            setIsEditing(false);
                                        }
                                    }}
                                    disabled={saving || saved}
                                    className={`px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:shadow-accent-purple/50 transition-all disabled:opacity-50 flex items-center gap-2 ${saved
                                        ? 'bg-green-500'
                                        : 'bg-gradient-to-r from-accent-purple to-accent-pink'
                                        }`}
                                >
                                    {saving ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Saving...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <Check className="w-5 h-5 animate-bounce" />
                                            Saved!
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Save Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Incoming Requests Section */}
                <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-accent-pink" />
                        Incoming Requests
                    </h2>

                    {incomingRequests.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                            <p className="text-text-secondary text-lg">No incoming requests at the moment</p>
                            <p className="text-text-secondary/60 text-sm mt-2">New booking requests will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {incomingRequests.map((request) => (
                                <div
                                    key={request.id}
                                    onClick={() => {
                                        setSelectedRequest(request);
                                        setShowRequestModal(true);
                                    }}
                                    className="bg-dark-elevated border border-dark-border rounded-2xl p-6 hover:border-accent-purple transition-all cursor-pointer"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-text-primary">{request.seeker?.username}</h3>
                                            {/* Seeker Gender and Age */}
                                            {(request.seeker?.profile?.gender || request.seeker?.profile?.age) && (
                                                <p className="text-sm text-text-muted mt-1">
                                                    {request.seeker?.profile?.gender && (
                                                        <span className="capitalize">{request.seeker.profile.gender.toLowerCase()}</span>
                                                    )}
                                                    {request.seeker?.profile?.gender && request.seeker?.profile?.age && ' • '}
                                                    {request.seeker?.profile?.age && (
                                                        <span>{request.seeker.profile.age} years</span>
                                                    )}
                                                </p>
                                            )}
                                            <p className="text-sm text-text-secondary">
                                                Requested on {new Date(request.created_at).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-accent-purple mt-1">Click to view seeker details</p>
                                        </div>
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleAcceptRequest(request.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-all"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(request.id)}
                                                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all"
                                            >
                                                Decline
                                            </button>
                                        </div>
                                    </div>

                                    {/* Seeker Preferences */}
                                    {request.seeker_preferences && (
                                        <div className="bg-dark-surface/50 rounded-xl p-4 space-y-2">
                                            <p className="text-sm font-medium text-text-secondary">Seeker Preferences:</p>
                                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                {request.seeker_preferences.consultation_type && (
                                                    <div>
                                                        <span className="text-text-secondary">Consultation: </span>
                                                        <span className="text-text-primary font-medium">
                                                            {request.seeker_preferences.consultation_type.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                                {request.seeker_preferences.service_scope && (
                                                    <div>
                                                        <span className="text-text-secondary">Scope: </span>
                                                        <span className="text-text-primary font-medium capitalize">
                                                            {request.seeker_preferences.service_scope.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                )}
                                                {request.seeker_preferences.services_selected && (
                                                    <div className="md:col-span-2">
                                                        <span className="text-text-secondary">Services: </span>
                                                        <span className="text-text-primary font-medium">
                                                            {request.seeker_preferences.services_selected.join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                                {request.seeker_preferences.budget_catalyst && (
                                                    <div>
                                                        <span className="text-text-secondary">Budget (Catalyst): </span>
                                                        <span className="text-text-primary font-medium">
                                                            ₹{request.seeker_preferences.budget_catalyst}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Matched Seekers Section */}
                <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Heart className="w-6 h-6 text-accent-gold" />
                        Matched Seekers
                    </h2>

                    {matchedSeekers.length === 0 ? (
                        <div className="text-center py-12">
                            <Heart className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                            <p className="text-text-secondary text-lg">No matched seekers yet</p>
                            <p className="text-text-secondary/60 text-sm mt-2">Confirmed bookings will appear here</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {matchedSeekers.map((match) => (
                                <div
                                    key={match.id}
                                    onClick={() => {
                                        setSelectedMatchedSeeker(match);
                                        setShowMatchedSeekerModal(true);
                                    }}
                                    className="bg-dark-elevated border border-dark-border rounded-2xl p-6 hover:border-accent-gold hover:shadow-lg hover:shadow-accent-gold/20 transition-all relative group cursor-pointer"
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSeekerToRemove(match);
                                            setShowRemoveConfirm(true);
                                        }}
                                        className="absolute top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all"
                                        title="Remove seeker"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-accent-purple to-accent-pink rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-text-primary">{match.seeker?.username}</h3>
                                            <p className="text-xs text-text-secondary">
                                                {match.status === 'CONFIRMED' ? 'Upcoming' : 'Completed'}
                                            </p>
                                            {/* Seeker Gender and Age */}
                                            {(match.seeker?.profile?.gender || match.seeker?.profile?.age) && (
                                                <p className="text-xs text-text-muted mt-1">
                                                    {match.seeker?.profile?.gender && (
                                                        <span className="capitalize">{match.seeker.profile.gender.toLowerCase()}</span>
                                                    )}
                                                    {match.seeker?.profile?.gender && match.seeker?.profile?.age && ' • '}
                                                    {match.seeker?.profile?.age && (
                                                        <span>{match.seeker.profile.age} years</span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {match.scheduled_time && (
                                        <div className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(match.scheduled_time).toLocaleDateString()}
                                        </div>
                                    )}

                                    {match.service && (
                                        <div className="mt-4 pt-4 border-t border-dark-border">
                                            <p className="text-xs text-text-secondary">Service</p>
                                            <p className="text-sm font-medium text-text-primary">{match.service.name}</p>
                                        </div>
                                    )}

                                    <p className="text-xs text-accent-purple mt-4">Click to view details</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Seeker Details Modal */}
            {showRequestModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowRequestModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                                    {selectedRequest.seeker?.username}
                                </h2>
                                <p className="text-text-secondary">Seeker Profile Details</p>
                            </div>
                            <button
                                onClick={() => setShowRequestModal(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Seeker Information */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-dark-elevated rounded-2xl p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-text-secondary">Username</p>
                                        <p className="text-text-primary font-medium">{selectedRequest.seeker?.username}</p>
                                    </div>
                                    {selectedRequest.seeker?.email && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Email</p>
                                            <p className="text-text-primary font-medium">{selectedRequest.seeker.email}</p>
                                        </div>
                                    )}
                                    {selectedRequest.seeker?.profile?.gender && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Gender</p>
                                            <p className="text-text-primary font-medium capitalize">
                                                {selectedRequest.seeker.profile.gender.toLowerCase()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedRequest.seeker?.profile?.age && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Age</p>
                                            <p className="text-text-primary font-medium">
                                                {selectedRequest.seeker.profile.age} years
                                            </p>
                                        </div>
                                    )}
                                    {selectedRequest.seeker?.profile?.address && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Address</p>
                                            <p className="text-text-primary font-medium">{selectedRequest.seeker.profile.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-dark-elevated rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Booking Request</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-text-secondary">Requested Date</p>
                                        <p className="text-text-primary font-medium">
                                            {new Date(selectedRequest.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {selectedRequest.notes && (
                                        <div>
                                            <p className="text-sm text-text-secondary mb-2">Message from Seeker</p>
                                            <p className="text-text-primary bg-dark-surface rounded-lg p-4">{selectedRequest.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seeker Preferences */}
                            {selectedRequest.seeker_preferences && (
                                <div className="bg-dark-elevated rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-text-primary mb-4">Seeker Preferences</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {selectedRequest.seeker_preferences.consultation_type && Array.isArray(selectedRequest.seeker_preferences.consultation_type) && selectedRequest.seeker_preferences.consultation_type.length > 0 && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Consultation Type</p>
                                                <p className="text-text-primary font-medium">
                                                    {selectedRequest.seeker_preferences.consultation_type.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedRequest.seeker_preferences.service_scope && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Service Scope</p>
                                                <p className="text-text-primary font-medium capitalize">
                                                    {typeof selectedRequest.seeker_preferences.service_scope === 'string'
                                                        ? selectedRequest.seeker_preferences.service_scope.replace('_', ' ')
                                                        : selectedRequest.seeker_preferences.service_scope}
                                                </p>
                                            </div>
                                        )}
                                        {selectedRequest.seeker_preferences.services_selected && Array.isArray(selectedRequest.seeker_preferences.services_selected) && selectedRequest.seeker_preferences.services_selected.length > 0 && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-text-secondary mb-2">Services Interested In</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedRequest.seeker_preferences.services_selected.map((service, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm capitalize">
                                                            {typeof service === 'string' ? service.replace('_', ' ') : service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => handleAcceptRequest(selectedRequest.id)}
                                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-semibold transition-all"
                                >
                                    Accept Request
                                </button>
                                <button
                                    onClick={() => handleRejectRequest(selectedRequest.id)}
                                    className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-500 font-semibold transition-all"
                                >
                                    Decline Request
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Matched Seeker Details Modal */}
            {showMatchedSeekerModal && selectedMatchedSeeker && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowMatchedSeekerModal(false)}>
                    <div className="bg-dark-surface border border-dark-border rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                                    {selectedMatchedSeeker.seeker?.username}
                                </h2>
                                <p className="text-text-secondary">Matched Seeker Details</p>
                            </div>
                            <button
                                onClick={() => setShowMatchedSeekerModal(false)}
                                className="text-text-secondary hover:text-text-primary transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Seeker Information */}
                        <div className="space-y-6">
                            {/* Basic Info */}
                            <div className="bg-dark-elevated rounded-2xl p-6 space-y-4">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Information</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-text-secondary">Username</p>
                                        <p className="text-text-primary font-medium">{selectedMatchedSeeker.seeker?.username}</p>
                                    </div>
                                    {selectedMatchedSeeker.seeker?.email && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Email</p>
                                            <p className="text-text-primary font-medium">{selectedMatchedSeeker.seeker.email}</p>
                                        </div>
                                    )}
                                    {selectedMatchedSeeker.seeker?.profile?.gender && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Gender</p>
                                            <p className="text-text-primary font-medium capitalize">
                                                {selectedMatchedSeeker.seeker.profile.gender.toLowerCase()}
                                            </p>
                                        </div>
                                    )}
                                    {selectedMatchedSeeker.seeker?.profile?.age && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Age</p>
                                            <p className="text-text-primary font-medium">
                                                {selectedMatchedSeeker.seeker.profile.age} years
                                            </p>
                                        </div>
                                    )}
                                    {selectedMatchedSeeker.seeker?.profile?.address && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-text-secondary">Address</p>
                                            <p className="text-text-primary font-medium">{selectedMatchedSeeker.seeker.profile.address}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Booking Details */}
                            <div className="bg-dark-elevated rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Booking Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-text-secondary">Status</p>
                                        <p className="text-text-primary font-medium">
                                            <span className={`px-3 py-1 rounded-lg text-sm ${selectedMatchedSeeker.status === 'CONFIRMED'
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {selectedMatchedSeeker.status === 'CONFIRMED' ? 'Confirmed - Upcoming' : 'Completed'}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary">Booking Created</p>
                                        <p className="text-text-primary font-medium">
                                            {new Date(selectedMatchedSeeker.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    {selectedMatchedSeeker.service && (
                                        <div>
                                            <p className="text-sm text-text-secondary">Service</p>
                                            <p className="text-text-primary font-medium">{selectedMatchedSeeker.service.name}</p>
                                        </div>
                                    )}
                                    {selectedMatchedSeeker.notes && (
                                        <div>
                                            <p className="text-sm text-text-secondary mb-2">Notes from Seeker</p>
                                            <p className="text-text-primary bg-dark-surface rounded-lg p-4">{selectedMatchedSeeker.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Seeker Preferences */}
                            {selectedMatchedSeeker.seeker_preferences && (
                                <div className="bg-dark-elevated rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-text-primary mb-4">Seeker Preferences</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {selectedMatchedSeeker.seeker_preferences.consultation_type && Array.isArray(selectedMatchedSeeker.seeker_preferences.consultation_type) && selectedMatchedSeeker.seeker_preferences.consultation_type.length > 0 && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Consultation Type</p>
                                                <p className="text-text-primary font-medium capitalize">
                                                    {selectedMatchedSeeker.seeker_preferences.consultation_type.join(', ')}
                                                </p>
                                            </div>
                                        )}
                                        {selectedMatchedSeeker.seeker_preferences.service_scope && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Service Scope</p>
                                                <p className="text-text-primary font-medium capitalize">
                                                    {typeof selectedMatchedSeeker.seeker_preferences.service_scope === 'string'
                                                        ? selectedMatchedSeeker.seeker_preferences.service_scope.replace('_', ' ')
                                                        : selectedMatchedSeeker.seeker_preferences.service_scope}
                                                </p>
                                            </div>
                                        )}
                                        {selectedMatchedSeeker.seeker_preferences.budget_catalyst && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Budget (Catalyst Fee)</p>
                                                <p className="text-text-primary font-medium">
                                                    ₹{selectedMatchedSeeker.seeker_preferences.budget_catalyst}
                                                </p>
                                            </div>
                                        )}
                                        {selectedMatchedSeeker.seeker_preferences.budget_personal && (
                                            <div>
                                                <p className="text-sm text-text-secondary">Budget (Personal Shopping)</p>
                                                <p className="text-text-primary font-medium">
                                                    ₹{selectedMatchedSeeker.seeker_preferences.budget_personal}
                                                </p>
                                            </div>
                                        )}
                                        {selectedMatchedSeeker.seeker_preferences.services_selected && Array.isArray(selectedMatchedSeeker.seeker_preferences.services_selected) && selectedMatchedSeeker.seeker_preferences.services_selected.length > 0 && (
                                            <div className="md:col-span-2">
                                                <p className="text-sm text-text-secondary mb-2">Services Interested In</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedMatchedSeeker.seeker_preferences.services_selected.map((service, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-accent-purple/20 text-accent-purple rounded-lg text-sm capitalize">
                                                            {typeof service === 'string' ? service.replace('_', ' ') : service}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 pt-4">
                                <button
                                    onClick={() => alert('Messaging feature coming soon!')}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-accent-purple/50 transition-all"
                                >
                                    View Messages
                                </button>

                                {selectedMatchedSeeker.status === 'CONFIRMED' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`${API_BASE_URL}/api/bookings/${selectedMatchedSeeker.id}/`, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        'Authorization': `Token ${localStorage.getItem('token')}`,
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({ status: 'COMPLETED' })
                                                });
                                                if (response.ok) {
                                                    await fetchMatchedSeekers();
                                                    setShowMatchedSeekerModal(false);
                                                } else {
                                                    alert('Failed to update booking status');
                                                }
                                            } catch (error) {
                                                console.error('Error updating booking:', error);
                                                alert('Failed to update booking: ' + error.message);
                                            }
                                        }}
                                        className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl text-white font-semibold transition-all"
                                    >
                                        Mark as Completed
                                    </button>
                                )}

                                {selectedMatchedSeeker.status === 'COMPLETED' && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`${API_BASE_URL}/api/bookings/${selectedMatchedSeeker.id}/`, {
                                                    method: 'PATCH',
                                                    headers: {
                                                        'Authorization': `Token ${localStorage.getItem('token')}`,
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({ status: 'CONFIRMED' })
                                                });
                                                if (response.ok) {
                                                    await fetchMatchedSeekers();
                                                    setShowMatchedSeekerModal(false);
                                                } else {
                                                    alert('Failed to update booking status');
                                                }
                                            } catch (error) {
                                                console.error('Error updating booking:', error);
                                                alert('Failed to update booking: ' + error.message);
                                            }
                                        }}
                                        className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-semibold transition-all"
                                    >
                                        Reopen Booking
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Remove Seeker Confirmation Modal */}
            {showRemoveConfirm && seekerToRemove && (
                <div
                    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
                    onClick={() => setShowRemoveConfirm(false)}
                >
                    <div
                        className="bg-dark-surface border border-dark-border rounded-3xl p-8 max-w-md w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-text-primary mb-2">
                                Remove Seeker?
                            </h3>

                            <p className="text-text-secondary mb-6">
                                Are you sure you want to remove <span className="text-text-primary font-semibold">{seekerToRemove.seeker?.username}</span> from your matched seekers? This action cannot be undone.
                            </p>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowRemoveConfirm(false)}
                                    className="flex-1 px-6 py-3 bg-dark-elevated hover:bg-dark-border rounded-xl text-text-primary font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRemoveSeeker}
                                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl text-white font-semibold transition-all"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalystDashboard;




