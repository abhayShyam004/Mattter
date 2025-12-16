import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    MapPin, Star, CheckCircle, XCircle, Mail, Phone,
    Clock, ArrowLeft, Send, Image as ImageIcon, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';
import StarRating from '../components/StarRating';
import ReportModal from '../components/ReportModal';

const CatalystProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [catalyst, setCatalyst] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
    const [showReportModal, setShowReportModal] = useState(false);

    useEffect(() => {
        fetchCatalystProfile();
    }, [id]);

    const fetchCatalystProfile = async () => {
        try {
            const token = localStorage.getItem('token');

            // Use optimized catalyst_view endpoint (returns all data including images in one fast call)
            const response = await fetch(`${API_BASE_URL}/api/profiles/${id}/catalyst_view/`, {
                headers: {
                    'Authorization': token ? `Token ${token}` : ''
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCatalyst(data); // Now includes is_active from backend
                if (data.portfolio_images?.length > 0) {
                    setSelectedImage(data.portfolio_images[0]);
                }
                setLoading(false);
            } else {
                console.error('Failed to fetch catalyst profile');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching catalyst:', error);
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        if (!message.trim()) {
            alert('Please enter a message');
            return;
        }

        setSending(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch seeker preferences
            let seekerPreferences = {};
            try {
                const prefResponse = await fetch(`${API_BASE_URL}/api/profiles/get_preferences/`, {
                    headers: {
                        'Authorization': `Token ${token}`
                    }
                });
                if (prefResponse.ok) {
                    const prefData = await prefResponse.json();
                    seekerPreferences = prefData.preferences || {};
                }
            } catch (error) {
                console.log('Could not fetch preferences, continuing without them:', error);
            }

            // Prepare booking data
            const bookingData = {
                catalyst_id: catalyst.user.id,  // Changed to catalyst_id
                service: null,
                scheduled_time: new Date().toISOString(),
                notes: message,
                seeker_preferences: seekerPreferences
            };

            console.log('Sending booking request with data:', JSON.stringify(bookingData, null, 2));
            console.log('Catalyst object:', JSON.stringify(catalyst, null, 2));

            const response = await fetch(`${API_BASE_URL}/api/bookings/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            const responseData = await response.json();
            console.log('Booking response:', responseData);

            if (response.ok) {
                // Show success state briefly before redirecting
                setSending(false);
                setMessage('✓ Request sent successfully!');

                // Wait 1.5 seconds to show success message, then redirect
                setTimeout(() => {
                    navigate('/seeker');
                }, 1500);
            } else {
                console.error('Booking error response:', responseData);
                alert(`Failed to send request: ${JSON.stringify(responseData)}`);
                setSending(false);
            }
        } catch (error) {
            console.error('Error sending request:', error);
            alert('Failed to send request: ' + error.message);
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!catalyst) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Catalyst not found</h2>
                    <button
                        onClick={() => navigate('/search')}
                        className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink rounded-xl text-white"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg">
            {/* Header with Back Button */}
            <div className="bg-dark-surface border-b border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-2 text-text-secondary hover:text-accent-purple transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Search</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {/* Left Column - Profile Info */}
                    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Hero Section */}
                        <div className="bg-dark-surface border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 sm:mb-6">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent break-words">
                                        {catalyst.user?.username || 'Unknown Catalyst'}
                                    </h1>
                                    {/* Gender and Age */}
                                    {(catalyst.gender || catalyst.age) && (
                                        <p className="text-sm sm:text-base text-text-muted mb-2">
                                            {catalyst.gender && <span className="capitalize">{catalyst.gender.toLowerCase()}</span>}
                                            {catalyst.gender && catalyst.age && <span> • </span>}
                                            {catalyst.age && <span>{catalyst.age} years old</span>}
                                        </p>
                                    )}
                                    {catalyst.bio_short && (
                                        <p className="text-base sm:text-lg md:text-xl text-text-secondary italic">"{catalyst.bio_short}"</p>
                                    )}
                                    {/* Rating */}
                                    <div className="mt-3">
                                        <StarRating
                                            rating={catalyst.average_rating || 0}
                                            count={catalyst.rating_count || 0}
                                            size="lg"
                                        />
                                    </div>
                                </div>
                                {catalyst.is_active ? (
                                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm sm:text-base flex-shrink-0">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-medium">Active</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-500/20 text-gray-400 rounded-full text-sm sm:text-base flex-shrink-0">
                                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                                        <span className="font-medium">Inactive</span>
                                    </div>
                                )}
                            </div>

                            {/* Location */}
                            <div className="mb-6">
                                {catalyst.address && (
                                    <div className="flex items-center gap-2 text-text-secondary">
                                        <MapPin className="w-5 h-5" />
                                        <span>{catalyst.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Bio */}
                            {catalyst.bio && (
                                <div className="mb-4 sm:mb-6">
                                    <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">About</h3>
                                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed">{catalyst.bio}</p>
                                </div>
                            )}

                            {/* Specializations */}
                            {catalyst.specializations && catalyst.specializations.length > 0 && (
                                <div>
                                    <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-3">Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {catalyst.specializations.map((spec, idx) => (
                                            <span
                                                key={idx}
                                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border border-accent-purple/30 text-accent-purple rounded-lg sm:rounded-xl font-medium text-sm sm:text-base"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Portfolio Gallery */}
                        {catalyst.portfolio_images && catalyst.portfolio_images.length > 0 && (
                            <div className="bg-dark-surface border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary mb-4 sm:mb-6 flex items-center gap-2">
                                    <ImageIcon className="w-6 h-6 text-accent-purple" />
                                    Portfolio
                                </h3>

                                {/* Main Image */}
                                <div
                                    className="mb-4 rounded-2xl overflow-hidden bg-dark-elevated aspect-video cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                        const index = catalyst.portfolio_images.indexOf(selectedImage);
                                        setLightboxImageIndex(index);
                                        setLightboxOpen(true);
                                    }}
                                >
                                    <img
                                        src={selectedImage}
                                        alt="Portfolio"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/800x600?text=Portfolio+Image';
                                        }}
                                    />
                                </div>

                                {/* Thumbnail Gallery */}
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                    {catalyst.portfolio_images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                                ? 'border-accent-purple scale-105'
                                                : 'border-dark-border hover:border-accent-purple/50'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`Portfolio ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/200?text=Image';
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-dark-surface border border-dark-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:sticky lg:top-4">
                            {/* Service Fee */}
                            <div className="text-center mb-6 pb-6 border-b border-dark-border">
                                {catalyst.hourly_rate ? (
                                    <>
                                        <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent-gold mb-2">
                                            ₹{catalyst.hourly_rate}
                                        </div>
                                        <div className="text-text-secondary text-sm">Service Fee</div>
                                    </>
                                ) : (
                                    <div className="text-text-secondary">Contact for pricing</div>
                                )}
                            </div>

                            {/* Booking Form */}
                            <div className="space-y-4">
                                <h3 className="text-base sm:text-lg font-semibold text-text-primary">Send Booking Request</h3>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Tell the catalyst what you're looking for..."
                                        rows={6}
                                        disabled={sending || message.startsWith('✓')}
                                        className={`w-full px-4 py-3 border rounded-xl placeholder-text-secondary/50 focus:ring-2 transition-all resize-none ${message.startsWith('✓')
                                            ? 'bg-green-500/20 border-green-500 text-green-400 font-semibold text-center'
                                            : 'bg-dark-elevated border-dark-border text-text-primary focus:border-accent-purple focus:ring-accent-purple/20'
                                            }`}
                                    />
                                </div>

                                <button
                                    onClick={handleSendRequest}
                                    disabled={sending || !catalyst.is_active || message.startsWith('✓')}
                                    className={`w-full px-6 py-4 rounded-xl text-white font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2 ${message.startsWith('✓')
                                        ? 'bg-green-500 shadow-lg shadow-green-500/50'
                                        : 'bg-gradient-to-r from-accent-purple to-accent-pink hover:shadow-lg hover:shadow-accent-purple/50 disabled:opacity-50'
                                        }`}
                                >
                                    {sending ? (
                                        <>
                                            <LoadingSpinner size="sm" color="text-white" />
                                            Sending...
                                        </>
                                    ) : message.startsWith('✓') ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Request Sent!
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            Send Request
                                        </>
                                    )}
                                </button>

                                {!catalyst.is_active && (
                                    <p className="text-xs text-yellow-500 text-center">
                                        This catalyst is currently not accepting requests
                                    </p>
                                )}

                                <p className="text-xs text-text-secondary text-center">
                                    You will be notified when the catalyst responds
                                </p>
                            </div>

                            {/* Report Button */}
                            <button
                                onClick={() => setShowReportModal(true)}
                                className="w-full mt-6 pt-6 border-t border-dark-border text-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <AlertTriangle className="w-5 h-5" />
                                <span>Report Catalyst</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox Modal */}
            {lightboxOpen && catalyst.portfolio_images && catalyst.portfolio_images.length > 0 && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-3 bg-dark-surface/80 hover:bg-dark-surface rounded-full transition-all z-10"
                    >
                        <XCircle className="w-6 h-6 text-text-primary" />
                    </button>

                    {/* Previous Button */}
                    {catalyst.portfolio_images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImageIndex((prev) =>
                                    prev === 0 ? catalyst.portfolio_images.length - 1 : prev - 1
                                );
                            }}
                            className="absolute left-4 p-3 bg-dark-surface/80 hover:bg-dark-surface rounded-full transition-all z-10"
                        >
                            <ArrowLeft className="w-6 h-6 text-text-primary" />
                        </button>
                    )}

                    {/* Image */}
                    <div
                        className="max-w-6xl w-full flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={catalyst.portfolio_images[lightboxImageIndex]}
                            alt={`Portfolio ${lightboxImageIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-xl"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/1200x800?text=Portfolio+Image';
                            }}
                        />
                        {/* Image Counter */}
                        <div className="text-center mt-4 text-text-secondary">
                            {lightboxImageIndex + 1} / {catalyst.portfolio_images.length}
                        </div>
                    </div>

                    {/* Next Button */}
                    {catalyst.portfolio_images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setLightboxImageIndex((prev) =>
                                    (prev + 1) % catalyst.portfolio_images.length
                                );
                            }}
                            className="absolute right-4 p-3 bg-dark-surface/80 hover:bg-dark-surface rounded-full transition-all z-10 transform rotate-180"
                        >
                            <ArrowLeft className="w-6 h-6 text-text-primary" />
                        </button>
                    )}
                </div>
            )}

            {/* Report Modal */}
            <ReportModal
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                reportedUser={catalyst?.user}
            />
        </div>
    );
};

export default CatalystProfile;




