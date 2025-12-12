import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PreferencesEditor from '../components/PreferencesEditor';

const SeekerDashboard = () => {
    const { user } = useAuth();
    const [showPreferences, setShowPreferences] = useState(false);
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                        Welcome Back{user?.user?.username && `, ${user.user.username}`}
                    </h1>
                    <p className="text-xl text-text-secondary">
                        Your style journey continues here
                    </p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Your Catalysts Card */}
                    <Link to="/catalysts" className="group">
                        <div className="relative overflow-hidden bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-purple transition-all duration-300 hover:scale-105">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-purple/20 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-8 h-8 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-text-primary">
                                    Your Catalysts
                                </h2>
                                <p className="text-text-secondary mb-6 text-sm">
                                    Connect with your trusted style experts
                                </p>

                                <div className="flex items-center text-accent-purple group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-medium text-sm">View all</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Discover More Card */}
                    <Link to="/search" className="group">
                        <div className="relative overflow-hidden bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-pink transition-all duration-300 hover:scale-105">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-pink/20 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-accent-gold rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-text-primary">
                                    Discover More
                                </h2>
                                <p className="text-text-secondary mb-6 text-sm">
                                    Find new catalysts to elevate your style
                                </p>

                                <div className="flex items-center text-accent-pink group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-medium text-sm">Explore</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* My Preferences Card */}
                    <button onClick={() => setShowPreferences(true)} className="group text-left">
                        <div className="relative overflow-hidden bg-dark-surface border border-dark-border rounded-2xl p-8 hover:border-accent-gold transition-all duration-300 hover:scale-105">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="absolute top-0 left-0 w-64 h-64 bg-accent-gold/20 rounded-full blur-3xl"></div>
                            </div>

                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-gradient-to-br from-accent-gold to-accent-blue rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Settings className="w-8 h-8 text-white" />
                                </div>

                                <h2 className="text-2xl font-bold mb-3 text-text-primary">
                                    My Preferences
                                </h2>
                                <p className="text-text-secondary mb-6 text-sm">
                                    Manage your style journey settings
                                </p>

                                <div className="flex items-center text-accent-gold group-hover:translate-x-2 transition-transform duration-300">
                                    <span className="font-medium text-sm">View & Edit</span>
                                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Stats Footer */}
                <div className="mt-16 grid grid-cols-3 gap-8 text-center">
                    <div>
                        <p className="text-3xl font-bold text-accent-purple mb-2">0</p>
                        <p className="text-text-muted text-sm">Active Catalysts</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-accent-blue mb-2">0</p>
                        <p className="text-text-muted text-sm">Bookings</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-accent-pink mb-2">0</p>
                        <p className="text-text-muted text-sm">Reviews</p>
                    </div>
                </div>
            </div>

            {/* Preferences Modal */}
            {showPreferences && (
                <PreferencesEditor onClose={() => setShowPreferences(false)} />
            )}
        </div>
    );
};

export default SeekerDashboard;
