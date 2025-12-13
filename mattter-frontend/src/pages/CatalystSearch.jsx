import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Loader, Search, Star } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// User location icon (blue)
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Catalyst location icon (violet)
const catalystIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to update map view
function SetViewOnLocation({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView([coords.latitude, coords.longitude], 13);
        }
    }, [coords, map]);
    return null;
}

const CatalystSearch = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [allCatalysts, setAllCatalysts] = useState([]); // All catalysts for map
    const [nearbyCatalysts, setNearbyCatalysts] = useState([]); // Catalysts within 10km for list
    const [filteredCatalysts, setFilteredCatalysts] = useState([]); // Filtered nearby catalysts
    const [userLocation, setUserLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [loadingCatalysts, setLoadingCatalysts] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCatalyst, setSelectedCatalyst] = useState(null);

    // Redirect catalysts to their dashboard
    useEffect(() => {
        if (user && user.role === 'CATALYST') {
            navigate('/catalyst');
        }
    }, [user, navigate]);

    // Request user location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setLoadingLocation(false);
                    fetchCatalysts(location);
                },
                (error) => {
                    setLocationError(error.message);
                    setLoadingLocation(false);
                    // Fallback to New Delhi
                    const fallbackLocation = { latitude: 28.6139, longitude: 77.2090 };
                    setUserLocation(fallbackLocation);
                    fetchCatalysts(fallbackLocation);
                }
            );
        } else {
            setLocationError('Geolocation is not supported');
            setLoadingLocation(false);
        }
    }, []);

    // Fetch catalysts from API
    const fetchCatalysts = async (location) => {
        setLoadingCatalysts(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch all catalysts for map (no radius limit)
            const allResponse = await fetch(
                `${API_BASE_URL}/api/profiles/?role=CATALYST`,
                {
                    headers: {
                        'Authorization': token ? `Token ${token}` : '',
                    },
                }
            );

            // Fetch nearby catalysts (10km) for list
            const nearbyResponse = await fetch(
                `${API_BASE_URL}/api/profiles/?role=CATALYST&lat=${location.latitude}&lon=${location.longitude}&radius=10000`,
                {
                    headers: {
                        'Authorization': token ? `Token ${token}` : '',
                    },
                }
            );

            if (allResponse.ok && nearbyResponse.ok) {
                const allData = await allResponse.json();
                const nearbyData = await nearbyResponse.json();

                // Filter out catalysts without location for map
                const catalystsWithLocation = allData.filter(c => c.latitude && c.longitude);

                setAllCatalysts(catalystsWithLocation);
                setNearbyCatalysts(nearbyData);
                setFilteredCatalysts(nearbyData);
            } else {
                console.error('Failed to fetch catalysts');
            }
        } catch (error) {
            console.error('Error fetching catalysts:', error);
        } finally {
            setLoadingCatalysts(false);
        }
    };

    // Filter nearby catalysts based on search
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCatalysts(nearbyCatalysts);
        } else {
            const filtered = nearbyCatalysts.filter(catalyst => {
                const searchLower = searchQuery.toLowerCase();
                const matchesName = catalyst.user?.username?.toLowerCase().includes(searchLower);
                const matchesBio = catalyst.bio?.toLowerCase().includes(searchLower);
                const matchesSpecializations = catalyst.specializations?.some(spec =>
                    spec.toLowerCase().includes(searchLower)
                );
                return matchesName || matchesBio || matchesSpecializations;
            });
            setFilteredCatalysts(filtered);
        }
    }, [searchQuery, nearbyCatalysts]);

    // Calculate distance in km
    const formatDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    };

    if (loadingLocation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-accent-purple animate-spin mx-auto mb-4" />
                    <p className="text-text-secondary">Requesting location access...</p>
                </div>
            </div>
        );
    }

    if (!userLocation && locationError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
                <div className="text-center max-w-md">
                    <MapPin className="w-16 h-16 text-accent-pink mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-text-primary mb-2">Location Access Required</h2>
                    <p className="text-text-secondary mb-6">
                        We need your location to find nearby catalysts. Please enable location access and refresh the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] bg-dark-bg">
            {/* Sidebar */}
            <div className="w-full md:w-1/3 bg-dark-surface border-r border-dark-border overflow-y-auto max-h-[60vh] md:max-h-none">
                <div className="p-4 sm:p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                            Find a Catalyst
                        </h2>
                        <p className="text-text-secondary text-sm">
                            {filteredCatalysts.length} catalysts within 10km
                        </p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name, style, specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-purple transition-colors"
                        />
                    </div>

                    {/* Loading State */}
                    {loadingCatalysts && (
                        <div className="text-center py-8">
                            <Loader className="w-8 h-8 text-accent-purple animate-spin mx-auto mb-2" />
                            <p className="text-text-secondary text-sm">Loading catalysts...</p>
                        </div>
                    )}

                    {/* Catalyst List */}
                    {!loadingCatalysts && filteredCatalysts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-text-secondary">No catalysts found nearby</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {filteredCatalysts.map((catalyst) => (
                            <div
                                key={catalyst.id}
                                onClick={() => setSelectedCatalyst(catalyst)}
                                className={`p-4 bg-dark-elevated border rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedCatalyst?.id === catalyst.id
                                    ? 'border-accent-purple shadow-lg shadow-accent-purple/20'
                                    : 'border-dark-border hover:border-accent-purple/50'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-lg text-text-primary">
                                            {catalyst.user?.username || 'Unknown'}
                                        </h3>
                                        {/* Gender and Age */}
                                        {(catalyst.gender || catalyst.age) && (
                                            <p className="text-sm text-text-muted">
                                                {catalyst.gender && <span className="capitalize">{catalyst.gender.toLowerCase()}</span>}
                                                {catalyst.gender && catalyst.age && <span> • </span>}
                                                {catalyst.age && <span>{catalyst.age} years</span>}
                                            </p>
                                        )}
                                    </div>
                                    {userLocation && catalyst.latitude && catalyst.longitude && (
                                        <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full">
                                            {formatDistance(userLocation.latitude, userLocation.longitude, catalyst.latitude, catalyst.longitude)}
                                        </span>
                                    )}
                                </div>

                                {catalyst.bio && (
                                    <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                                        {catalyst.bio}
                                    </p>
                                )}

                                {/* Rating */}
                                <div className="mb-3">
                                    <StarRating
                                        rating={catalyst.average_rating || 0}
                                        count={catalyst.rating_count || 0}
                                        size="sm"
                                    />
                                </div>

                                {catalyst.specializations && catalyst.specializations.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {catalyst.specializations.slice(0, 3).map((spec, idx) => (
                                            <span
                                                key={idx}
                                                className="text-xs bg-dark-border text-text-secondary px-2 py-1 rounded"
                                            >
                                                {spec}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    {catalyst.hourly_rate && (
                                        <span className="text-accent-gold font-semibold">
                                            ₹{catalyst.hourly_rate} <span className="text-xs text-text-muted">Service Fee</span>
                                        </span>
                                    )}
                                </div>

                                {/* View Profile Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.location.href = `/catalyst/${catalyst.id}`;
                                    }}
                                    className="mt-4 w-full px-4 py-2 bg-gradient-to-r from-accent-purple to-accent-pink rounded-lg text-white font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all"
                                >
                                    View Profile
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="w-full md:w-2/3 relative h-[40vh] md:h-auto p-4 md:p-0">
                <div className="h-full border-2 border-dark-border rounded-xl md:rounded-none overflow-hidden">
                    {userLocation && (
                        <MapContainer
                            center={[userLocation.latitude, userLocation.longitude]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            />
                            <SetViewOnLocation coords={userLocation} />

                            {/* User Location Marker */}
                            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
                                <Popup>
                                    <div className="text-center">
                                        <strong>You are here</strong>
                                    </div>
                                </Popup>
                            </Marker>

                            {/* Catalyst Markers - Show ALL catalysts */}
                            {allCatalysts.map((catalyst) => {
                                if (!catalyst.latitude || !catalyst.longitude) return null;
                                return (
                                    <Marker
                                        key={catalyst.id}
                                        position={[catalyst.latitude, catalyst.longitude]}
                                        icon={catalystIcon}
                                        eventHandlers={{
                                            click: () => setSelectedCatalyst(catalyst),
                                        }}
                                    >
                                        <Popup className="custom-popup">
                                            <div className="min-w-[200px]">
                                                <strong className="block mb-2 text-base">{catalyst.user?.username || 'Unknown'}</strong>
                                                {(catalyst.gender || catalyst.age) && (
                                                    <p className="text-xs text-gray-600 mb-2">
                                                        {catalyst.gender && <span className="capitalize">{catalyst.gender.toLowerCase()}</span>}
                                                        {catalyst.gender && catalyst.age && <span> • </span>}
                                                        {catalyst.age && <span>{catalyst.age} years</span>}
                                                    </p>
                                                )}
                                                {catalyst.bio && (
                                                    <p className="text-sm text-gray-600 mb-2">{catalyst.bio.slice(0, 80)}{catalyst.bio.length > 80 ? '...' : ''}</p>
                                                )}
                                                {/* Rating */}
                                                <div className="mb-2">
                                                    <StarRating
                                                        rating={catalyst.average_rating || 0}
                                                        count={catalyst.rating_count || 0}
                                                        size="sm"
                                                    />
                                                </div>
                                                {catalyst.hourly_rate && (
                                                    <p className="text-sm font-semibold text-purple-600 mb-2">₹{catalyst.hourly_rate} Service Fee</p>
                                                )}
                                                {userLocation && (
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        {formatDistance(userLocation.latitude, userLocation.longitude, catalyst.latitude, catalyst.longitude)} away
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        window.location.href = `/catalyst/${catalyst.id}`;
                                                    }}
                                                    className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg font-medium hover:shadow-lg transition-all"
                                                >
                                                    View Profile
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                        </MapContainer>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CatalystSearch;
