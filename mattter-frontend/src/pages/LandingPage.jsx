import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Sparkles, Users, MapPin, Zap, Heart, Calendar, ChevronRight } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for user location
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom marker icon for catalysts
const catalystIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to set map view when location changes
function SetViewOnLocation({ coords }) {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView([coords.latitude, coords.longitude], 13);
        }
    }, [coords, map]);
    return null;
}

const LandingPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [nearbyCatalysts, setNearbyCatalysts] = useState([]);
    const [loadingCatalysts, setLoadingCatalysts] = useState(false);
    const [catalystError, setCatalystError] = useState(null);

    // Fetch nearby catalysts when user location is available
    useEffect(() => {
        if (userLocation) {
            fetchNearbyCatalysts();
        }
    }, [userLocation]);

    const fetchNearbyCatalysts = async () => {
        setLoadingCatalysts(true);
        setCatalystError(null);

        try {
            const response = await fetch(
                `http://localhost:8000/api/profiles/nearby_catalysts/?lat=${userLocation.latitude}&lon=${userLocation.longitude}&radius=20000000`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch catalysts');
            }

            const data = await response.json();

            if (data.success) {
                setNearbyCatalysts(data.catalysts || []);
            } else {
                setCatalystError('Failed to load catalysts');
            }
        } catch (error) {
            console.error('Error fetching catalysts:', error);
            setCatalystError(error.message);
        } finally {
            setLoadingCatalysts(false);
        }
    };

    useEffect(() => {
        // Request user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    setLocationError(error.message);
                    setLoadingLocation(false);
                    // Default to a sample location if permission denied
                    setUserLocation({ latitude: 28.6139, longitude: 77.2090 }); // New Delhi as fallback
                }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser');
            setLoadingLocation(false);
        }
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center px-4 py-20 overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-purple/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-pink/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                <div className="relative z-10 max-w-6xl w-full">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center space-x-2 bg-dark-elevated border border-dark-border rounded-full px-6 py-3 mb-8">
                            <Sparkles className="w-5 h-5 text-accent-gold" />
                            <span className="text-text-secondary">Elevate Your Style Journey</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent leading-tight">
                            Your Personal
                            <br />
                            Style Catalyst
                        </h1>

                        <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-12">
                            Connect with expert fashion stylists in your area for in-person consultations.
                            Book physical appointments, get personalized wardrobe recommendations, and transform your style face-to-face.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {user ? (
                                <Link
                                    to={user.role === 'SEEKER' ? '/seeker' : '/catalyst'}
                                    className="group px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-accent-purple/50 transition-all flex items-center justify-center space-x-2"
                                >
                                    <span>Go to Dashboard</span>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/register"
                                        className="group px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-accent-purple/50 transition-all flex items-center justify-center space-x-2"
                                    >
                                        <span>Get Started</span>
                                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 bg-dark-elevated border border-dark-border text-text-primary rounded-xl font-semibold text-lg hover:bg-dark-surface hover:border-accent-purple transition-all"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                            Why Choose Mattter?
                        </h2>
                        <p className="text-xl text-text-secondary">
                            Your complete style transformation platform
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Feature 1 */}
                        <div className="group relative bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-purple transition-all duration-300 hover:scale-105">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/20 rounded-full blur-2xl"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mb-4">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-text-primary">Personal Catalysts</h3>
                                <p className="text-text-secondary">Meet certified fashion experts in person for personalized styling sessions</p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-pink transition-all duration-300 hover:scale-105">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-pink/20 rounded-full blur-2xl"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-pink to-accent-gold rounded-xl flex items-center justify-center mb-4">
                                    <Heart className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-text-primary">Smart Wardrobe</h3>
                                <p className="text-text-secondary">Organize and manage your wardrobe with AI-powered recommendations</p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-blue transition-all duration-300 hover:scale-105">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/20 rounded-full blur-2xl"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-blue to-accent-purple rounded-xl flex items-center justify-center mb-4">
                                    <Zap className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-text-primary">In-Person Guidance</h3>
                                <p className="text-text-secondary">Get hands-on style advice during physical consultations with local experts</p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group relative bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-gold transition-all duration-300 hover:scale-105">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-gold/20 rounded-full blur-2xl"></div>
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-gradient-to-br from-accent-gold to-accent-pink rounded-xl flex items-center justify-center mb-4">
                                    <Calendar className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-text-primary">Easy Booking</h3>
                                <p className="text-text-secondary">Schedule physical appointments and meet your favorite stylists in person</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Discover More Section with Map */}
            <section className="py-24 px-4 bg-dark-surface/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                            Discover Catalysts Across India
                        </h2>
                        <p className="text-xl text-text-secondary">
                            Explore all our expert stylists and book in-person appointments to transform your look
                        </p>
                    </div>

                    <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
                        {loadingLocation ? (
                            <div className="h-96 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-accent-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-text-secondary">Loading map...</p>
                                </div>
                            </div>
                        ) : locationError && !userLocation ? (
                            <div className="h-96 flex items-center justify-center">
                                <div className="text-center px-8">
                                    <MapPin className="w-16 h-16 text-accent-pink mx-auto mb-4" />
                                    <h3 className="text-xl font-bold mb-2 text-text-primary">Location Access Needed</h3>
                                    <p className="text-text-secondary mb-6">
                                        Enable location access to discover nearby catalysts
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg transition-all"
                                    >
                                        Enable Location
                                    </button>
                                </div>
                            </div>
                        ) : userLocation ? (
                            <div className="h-96 relative">
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

                                    {/* Nearby Catalysts Markers */}
                                    {nearbyCatalysts.map((catalyst) => (
                                        <Marker
                                            key={catalyst.id}
                                            position={[catalyst.latitude, catalyst.longitude]}
                                            icon={catalystIcon}
                                        >
                                            <Popup>
                                                <div className="text-center">
                                                    <strong className="block mb-1">{catalyst.name}</strong>
                                                    {catalyst.specializations && catalyst.specializations.length > 0 && (
                                                        <span className="text-sm text-gray-600">{catalyst.specializations.join(', ')}</span>
                                                    )}
                                                    {catalyst.bio && (
                                                        <p className="text-xs text-gray-500 mt-1">{catalyst.bio.substring(0, 100)}</p>
                                                    )}
                                                    {catalyst.distance && (
                                                        <p className="text-xs text-gray-400 mt-1">{(catalyst.distance / 1000).toFixed(1)} km away</p>
                                                    )}
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                            </div>
                        ) : null}
                    </div>

                    {/* Catalyst Info */}
                    {userLocation && (
                        <div className="mt-6 text-center">
                            {loadingCatalysts ? (
                                <p className="text-text-secondary">
                                    <span className="inline-block w-4 h-4 border-2 border-accent-purple border-t-transparent rounded-full animate-spin mr-2 align-middle"></span>
                                    Loading nearby catalysts...
                                </p>
                            ) : catalystError ? (
                                <p className="text-red-400">Error loading catalysts: {catalystError}</p>
                            ) : (
                                <p className="text-text-secondary">
                                    {nearbyCatalysts.length === 0 ? (
                                        <>No catalysts have registered yet. Check back soon!</>
                                    ) : (
                                        <>Showing {nearbyCatalysts.length} registered catalyst{nearbyCatalysts.length !== 1 ? 's' : ''}</>
                                    )}
                                </p>
                            )}
                        </div>
                    )}

                    {userLocation && !locationError && (
                        <div className="mt-8 text-center">
                            <Link
                                to="/search"
                                className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-accent-purple/50 transition-all"
                            >
                                <span>Explore All Catalysts</span>
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent">
                            How It Works
                        </h2>
                        <p className="text-xl text-text-secondary">
                            Your journey to perfect style in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Step 1 */}
                        <div className="relative">
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    1
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Create Your Profile</h3>
                                <p className="text-text-secondary">
                                    Sign up and tell us about your style preferences and fashion goals
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative">
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    2
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Find Your Catalyst</h3>
                                <p className="text-text-secondary">
                                    Browse local stylists, book appointments, and meet them in person
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative">
                            <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                                    3
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-text-primary">Transform Your Style</h3>
                                <p className="text-text-secondary">
                                    Attend in-person sessions for personalized advice, wardrobe makeovers, and ongoing support
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="relative bg-gradient-to-br from-accent-purple/10 to-accent-pink/10 border border-accent-purple/20 rounded-3xl p-12 overflow-hidden">
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/30 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/30 rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                                Ready to Elevate Your Style?
                            </h2>
                            <p className="text-xl text-text-secondary mb-8">
                                Join thousands of style seekers who have transformed their wardrobe with Mattter
                            </p>

                            {!user && (
                                <Link
                                    to="/register"
                                    className="inline-flex items-center space-x-2 px-10 py-5 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-accent-purple/50 transition-all"
                                >
                                    <span>Start Your Journey</span>
                                    <ChevronRight className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
