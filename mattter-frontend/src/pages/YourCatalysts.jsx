import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, CheckCircle, Trash2, ArrowLeft, Loader, Search, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { API_BASE_URL } from '../config';
import RatingModal from '../components/RatingModal';

const YourCatalysts = () => {
    const navigate = useNavigate();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [matchedCatalysts, setMatchedCatalysts] = useState([]);
    const [filteredPending, setFilteredPending] = useState([]);
    const [filteredMatched, setFilteredMatched] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [expandedPending, setExpandedPending] = useState(new Set());
    const [expandedMatched, setExpandedMatched] = useState(new Set());
    const [searchPending, setSearchPending] = useState('');
    const [searchMatched, setSearchMatched] = useState('');
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [catalystToRate, setCatalystToRate] = useState(null);
    const [bookingToRate, setBookingToRate] = useState(null);
    const [catalystRatings, setCatalystRatings] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [matchedToDelete, setMatchedToDelete] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    // Filter pending requests based on search
    useEffect(() => {
        if (searchPending.trim() === '') {
            setFilteredPending(pendingRequests);
        } else {
            const filtered = pendingRequests.filter(booking => {
                const searchLower = searchPending.toLowerCase();
                const name = booking.catalyst?.username?.toLowerCase() || '';
                const bio = booking.catalyst?.profile?.bio_short?.toLowerCase() || '';
                const notes = booking.notes?.toLowerCase() || '';
                return name.includes(searchLower) || bio.includes(searchLower) || notes.includes(searchLower);
            });
            setFilteredPending(filtered);
        }
    }, [searchPending, pendingRequests]);

    // Filter matched catalysts based on search
    useEffect(() => {
        if (searchMatched.trim() === '') {
            setFilteredMatched(matchedCatalysts);
        } else {
            const filtered = matchedCatalysts.filter(booking => {
                const searchLower = searchMatched.toLowerCase();
                const name = booking.catalyst?.username?.toLowerCase() || '';
                const bio = booking.catalyst?.profile?.bio_short?.toLowerCase() || '';
                const specs = booking.catalyst?.profile?.specializations?.join(' ').toLowerCase() || '';
                return name.includes(searchLower) || bio.includes(searchLower) || specs.includes(searchLower);
            });
            setFilteredMatched(filtered);
        }
    }, [searchMatched, matchedCatalysts]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Bookings data:', data);

                // Separate bookings by status
                const pending = data.filter(b => b.status === 'REQUESTED');
                const matched = data.filter(b => b.status === 'CONFIRMED' || b.status === 'COMPLETED');

                setPendingRequests(pending);
                setMatchedCatalysts(matched);
                setFilteredPending(pending);
                setFilteredMatched(matched);

                // Check existing ratings for matched catalysts
                checkExistingRatings(matched);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkExistingRatings = async (bookings) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/ratings/`, {
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                const ratings = await response.json();
                // Create a map of catalyst_id to rating for quick lookup
                const ratingsMap = {};
                ratings.forEach(rating => {
                    if (rating.catalyst && rating.catalyst.id) {
                        ratingsMap[rating.catalyst.id] = rating;
                    }
                });
                setCatalystRatings(ratingsMap);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleDeleteRequest = async (bookingId) => {
        if (!confirm('Are you sure you want to delete this request?')) return;

        setDeletingId(bookingId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}/delete_booking/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                await fetchBookings();
            } else {
                alert('Failed to delete request');
            }
        } catch (error) {
            console.error('Error deleting request:', error);
            alert('Failed to delete request');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDeleteMatched = async () => {
        if (!matchedToDelete) return;

        setDeletingId(matchedToDelete.id);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings/${matchedToDelete.id}/delete_booking/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });

            if (response.ok) {
                // Remove from both lists
                setMatchedCatalysts(prev => prev.filter(b => b.id !== matchedToDelete.id));
                setFilteredMatched(prev => prev.filter(b => b.id !== matchedToDelete.id));
                setShowDeleteModal(false);
                setMatchedToDelete(null);
            } else {
                alert('Failed to remove catalyst');
            }
        } catch (error) {
            console.error('Error removing catalyst:', error);
            alert('Failed to remove catalyst');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleExpanded = (bookingId, type) => {
        if (type === 'pending') {
            const newExpanded = new Set(expandedPending);
            if (newExpanded.has(bookingId)) {
                newExpanded.delete(bookingId);
            } else {
                newExpanded.add(bookingId);
            }
            setExpandedPending(newExpanded);
        } else {
            const newExpanded = new Set(expandedMatched);
            if (newExpanded.has(bookingId)) {
                newExpanded.delete(bookingId);
            } else {
                newExpanded.add(bookingId);
            }
            setExpandedMatched(newExpanded);
        }
    };

    const handleOpenRatingModal = (booking, existingRating = null) => {
        setCatalystToRate(booking.catalyst);
        setBookingToRate(booking);
        // Store the existing rating if editing
        if (existingRating) {
            setBookingToRate({ ...booking, existingRating });
        }
        setShowRatingModal(true);
    };

    const handleRatingSubmitted = async () => {
        // Refresh ratings after submission
        const currentMatched = [...matchedCatalysts];
        await checkExistingRatings(currentMatched);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-12 h-12 text-accent-purple animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/seeker')}
                        className="flex items-center gap-2 text-text-secondary hover:text-accent-purple transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Dashboard</span>
                    </button>

                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                        Your Catalysts
                    </h1>
                    <p className="text-text-secondary">
                        Manage your catalyst connections and requests
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Pending Requests Section */}
                    <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-accent-purple" />
                                <h2 className="text-2xl font-bold text-text-primary">
                                    Pending Requests ({filteredPending.length})
                                </h2>
                            </div>

                            {/* Search Bar */}
                            {pendingRequests.length > 0 && (
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search requests..."
                                        value={searchPending}
                                        onChange={(e) => setSearchPending(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {filteredPending.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                                <p className="text-text-secondary text-lg">
                                    {searchPending ? 'No matching requests found' : 'No pending requests'}
                                </p>
                                <p className="text-text-secondary/60 text-sm mt-2">
                                    {searchPending ? 'Try a different search term' : 'Requests you send to catalysts will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredPending.map((booking) => {
                                    const isExpanded = expandedPending.has(booking.id);
                                    return (
                                        <div
                                            key={booking.id}
                                            className="bg-dark-elevated border border-dark-border rounded-xl overflow-hidden hover:border-accent-purple/50 transition-all"
                                        >
                                            {/* Collapsed Preview */}
                                            <div
                                                onClick={() => toggleExpanded(booking.id, 'pending')}
                                                className="p-4 cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-bold text-text-primary">
                                                            {booking.catalyst?.username || 'Unknown Catalyst'}
                                                        </h3>
                                                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                                            Pending
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-text-muted">
                                                        Requested on {new Date(booking.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {isExpanded ? (
                                                    <ChevronUp className="w-5 h-5 text-text-secondary" />
                                                ) : (
                                                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                                                )}
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 border-t border-dark-border pt-4">
                                                    {(booking.catalyst?.profile?.gender || booking.catalyst?.profile?.age) && (
                                                        <p className="text-sm text-text-muted mb-3">
                                                            {booking.catalyst?.profile?.gender && <span className="capitalize">{booking.catalyst.profile.gender.toLowerCase()}</span>}
                                                            {booking.catalyst?.profile?.gender && booking.catalyst?.profile?.age && ' • '}
                                                            {booking.catalyst?.profile?.age && <span>{booking.catalyst.profile.age} years</span>}
                                                        </p>
                                                    )}

                                                    {booking.catalyst?.profile?.bio_short && (
                                                        <p className="text-sm text-text-secondary mb-3">
                                                            {booking.catalyst.profile.bio_short}
                                                        </p>
                                                    )}

                                                    {booking.notes && (
                                                        <div className="mb-4">
                                                            <p className="text-xs text-text-muted mb-1">Your message:</p>
                                                            <p className="text-sm text-text-secondary bg-dark-surface rounded-lg p-3">
                                                                {booking.notes}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/catalyst/${booking.catalyst?.profile?.id}`);
                                                            }}
                                                            className="flex-1 px-4 py-2 bg-dark-border hover:bg-dark-border/70 rounded-lg text-text-primary text-sm transition-all"
                                                        >
                                                            View Profile
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteRequest(booking.id);
                                                            }}
                                                            disabled={deletingId === booking.id}
                                                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all disabled:opacity-50"
                                                            title="Delete request"
                                                        >
                                                            {deletingId === booking.id ? (
                                                                <Loader className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Matched Catalysts Section */}
                    <div className="bg-dark-surface border border-dark-border rounded-3xl p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-accent-gold" />
                                <h2 className="text-2xl font-bold text-text-primary">
                                    Matched Catalysts ({filteredMatched.length})
                                </h2>
                            </div>

                            {/* Search Bar */}
                            {matchedCatalysts.length > 0 && (
                                <div className="relative w-full md:w-64">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                                    <input
                                        type="text"
                                        placeholder="Search catalysts..."
                                        value={searchMatched}
                                        onChange={(e) => setSearchMatched(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {filteredMatched.length === 0 ? (
                            <div className="text-center py-12">
                                <Users className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
                                <p className="text-text-secondary text-lg">
                                    {searchMatched ? 'No matching catalysts found' : 'No matched catalysts yet'}
                                </p>
                                <p className="text-text-secondary/60 text-sm mt-2">
                                    {searchMatched ? 'Try a different search term' : 'When catalysts accept your requests, they\'ll appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredMatched.map((booking) => {
                                    const isExpanded = expandedMatched.has(booking.id);
                                    return (
                                        <div
                                            key={booking.id}
                                            className="bg-dark-elevated border border-accent-gold/30 rounded-xl overflow-hidden hover:border-accent-gold transition-all"
                                        >
                                            {/* Collapsed Preview */}
                                            <div
                                                onClick={() => toggleExpanded(booking.id, 'matched')}
                                                className="p-4 cursor-pointer flex items-center justify-between"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-bold text-text-primary">
                                                            {booking.catalyst?.username || 'Unknown Catalyst'}
                                                        </h3>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'CONFIRMED'
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : 'bg-blue-500/20 text-blue-400'
                                                            }`}>
                                                            {booking.status === 'CONFIRMED' ? 'Active' : 'Completed'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-text-muted">
                                                        Matched on {new Date(booking.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {/* Small Rate Button */}
                                                    {catalystRatings[booking.catalyst?.id] ? (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenRatingModal(booking, catalystRatings[booking.catalyst?.id]);
                                                            }}
                                                            className="px-3 py-1.5 bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold/50 rounded-lg text-accent-gold text-xs transition-all flex items-center gap-1.5"
                                                            title="Edit your rating"
                                                        >
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span>{catalystRatings[booking.catalyst?.id].rating}</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleOpenRatingModal(booking);
                                                            }}
                                                            className="px-3 py-1.5 bg-accent-gold/20 hover:bg-accent-gold/30 border border-accent-gold/50 rounded-lg text-accent-gold text-xs transition-all flex items-center gap-1.5"
                                                            title="Rate this catalyst"
                                                        >
                                                            <Star className="w-3.5 h-3.5" />
                                                            <span>Rate</span>
                                                        </button>
                                                    )}
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-text-secondary" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-text-secondary" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="px-4 pb-4 border-t border-dark-border pt-4">
                                                    {(booking.catalyst?.profile?.gender || booking.catalyst?.profile?.age) && (
                                                        <p className="text-sm text-text-muted mb-3">
                                                            {booking.catalyst?.profile?.gender && <span className="capitalize">{booking.catalyst.profile.gender.toLowerCase()}</span>}
                                                            {booking.catalyst?.profile?.gender && booking.catalyst?.profile?.age && ' • '}
                                                            {booking.catalyst?.profile?.age && <span>{booking.catalyst.profile.age} years</span>}
                                                        </p>
                                                    )}

                                                    {booking.catalyst?.profile?.bio_short && (
                                                        <p className="text-sm text-text-secondary mb-3">
                                                            {booking.catalyst.profile.bio_short}
                                                        </p>
                                                    )}

                                                    {booking.catalyst?.profile?.specializations && booking.catalyst.profile.specializations.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {booking.catalyst.profile.specializations.slice(0, 3).map((spec, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded"
                                                                >
                                                                    {spec}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}

                                                    <div className="space-y-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                navigate(`/catalyst/${booking.catalyst?.profile?.id}`);
                                                            }}
                                                            className="w-full px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink rounded-lg text-white font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all"
                                                        >
                                                            View Profile
                                                        </button>
                                                        {/* Remove Catalyst Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setMatchedToDelete(booking);
                                                                setShowDeleteModal(true);
                                                            }}
                                                            disabled={deletingId === booking.id}
                                                            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            {deletingId === booking.id ? 'Removing...' : 'Remove Catalyst'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            {showRatingModal && catalystToRate && (
                <RatingModal
                    catalyst={catalystToRate}
                    booking={bookingToRate}
                    existingRating={bookingToRate?.existingRating}
                    onClose={() => setShowRatingModal(false)}
                    onRatingSubmitted={handleRatingSubmitted}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && matchedToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-dark-surface border border-dark-border rounded-2xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">
                            Remove Catalyst?
                        </h3>
                        <p className="text-text-secondary mb-2">
                            Are you sure you want to remove <span className="font-semibold text-text-primary">{matchedToDelete.catalyst?.username}</span> from your catalysts?
                        </p>
                        <p className="text-sm text-red-400 mb-6">
                            ⚠️ This action cannot be undone. You'll lose your connection history with this catalyst.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setMatchedToDelete(null);
                                }}
                                className="flex-1 px-4 py-3 bg-dark-border hover:bg-dark-border/70 rounded-lg text-text-primary transition-all"
                                disabled={deletingId === matchedToDelete.id}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteMatched}
                                disabled={deletingId === matchedToDelete.id}
                                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-lg text-white font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {deletingId === matchedToDelete.id ? (
                                    <>
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Removing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-5 h-5" />
                                        Remove
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourCatalysts;
