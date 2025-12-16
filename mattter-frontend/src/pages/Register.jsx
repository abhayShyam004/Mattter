import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles, X, FileText } from 'lucide-react';
import { API_BASE_URL } from '../config';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        gender: '',
        age: '',
        role: 'SEEKER'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!termsAccepted) {
            setError('You must accept the Terms & Conditions to register.');
            setIsLoading(false);
            return;
        }

        try {
            await register(formData);

            // If registering as a catalyst, capture and save location
            if (formData.role === 'CATALYST') {
                // Request location permission
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            // Save location to profile
                            try {
                                const token = localStorage.getItem('token');
                                await fetch(`${API_BASE_URL}/api/profiles/me/`, {
                                    method: 'PATCH',
                                    headers: {
                                        'Authorization': `Token ${token}`,
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({
                                        latitude: position.coords.latitude,
                                        longitude: position.coords.longitude
                                    })
                                });
                                console.log('Location saved:', position.coords.latitude, position.coords.longitude);
                            } catch (locationError) {
                                console.error('Failed to save location:', locationError);
                            }
                            // Navigate to dashboard
                            navigate('/catalyst');
                        },
                        (error) => {
                            console.log('Location permission denied or failed:', error.message);
                            // Still navigate even if location fails
                            navigate('/catalyst');
                        }
                    );
                } else {
                    // Geolocation not supported, navigate anyway
                    navigate('/catalyst');
                }
            } else {
                // For seekers, go to onboarding
                navigate('/onboarding');
            }
        } catch (err) {
            setError('Registration failed. Username might be taken.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-0 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-gold/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Logo */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-gold rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-blue via-accent-purple to-accent-gold bg-clip-text text-transparent">
                        Join Mattter
                    </h2>
                    <p className="mt-2 text-text-secondary">
                        Start your style transformation today
                    </p>
                </div>

                {/* Form */}
                <div className="bg-dark-surface border border-dark-border rounded-2xl p-8 shadow-2xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-2">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Gender Selection */}
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-text-secondary mb-2">
                                Gender *
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="">Select your gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHERS">Others</option>
                            </select>
                        </div>

                        {/* Age Input */}
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-text-secondary mb-2">
                                Age *
                            </label>
                            <input
                                id="age"
                                name="age"
                                type="number"
                                min="13"
                                max="120"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
                                placeholder="Enter your age"
                                value={formData.age}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-text-secondary mb-2">
                                I am a...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'SEEKER' })}
                                    className={`px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'SEEKER'
                                        ? 'bg-accent-purple/20 border-accent-purple text-accent-purple'
                                        : 'bg-dark-elevated border-dark-border text-text-secondary hover:border-dark-elevated'
                                        }`}
                                >
                                    <div className="font-medium">Seeker</div>
                                    <div className="text-xs mt-1">Find your style</div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role: 'CATALYST' })}
                                    className={`px-4 py-3 rounded-lg border-2 transition-all ${formData.role === 'CATALYST'
                                        ? 'bg-accent-blue/20 border-accent-blue text-accent-blue'
                                        : 'bg-dark-elevated border-dark-border text-text-secondary hover:border-dark-elevated'
                                        }`}
                                >
                                    <div className="font-medium">Catalyst</div>
                                    <div className="text-xs mt-1">Share expertise</div>
                                </button>
                            </div>
                        </div>

                        {/* Terms & Conditions Checkbox */}
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="w-4 h-4 text-accent-blue bg-dark-elevated border-dark-border rounded focus:ring-accent-blue focus:ring-2 cursor-pointer disabled:opacity-50"
                                    checked={termsAccepted}
                                    readOnly
                                    onClick={() => !termsAccepted && setShowTermsModal(true)}
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="terms" className="text-text-secondary">
                                    I agree to the{' '}
                                    <button
                                        type="button"
                                        onClick={() => setShowTermsModal(true)}
                                        className="text-accent-blue hover:text-accent-gold underline focus:outline-none"
                                    >
                                        Terms & Conditions
                                    </button>
                                    {' '}(Click to read)
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-gold text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/50 transition-all transform hover:scale-105 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <LoadingSpinner size="sm" color="text-white" />
                                    <span>Creating Account...</span>
                                </div>
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" />
                                    <span>Create Account</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-text-muted text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-accent-blue hover:text-accent-gold transition-colors font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Terms Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-dark-surface border border-dark-border rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowTermsModal(false)}
                            className="absolute top-4 right-4 text-text-secondary hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 bg-accent-blue/10 rounded-lg">
                                <FileText className="w-6 h-6 text-accent-blue" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Terms & Conditions</h3>
                        </div>

                        <div className="space-y-4 text-text-secondary text-sm max-h-[60vh] overflow-y-auto pr-2">
                            <p>Welcome to Mattter. By registering, you agree to the following short terms:</p>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>
                                    <strong className="text-text-primary">Respect Our Community:</strong> Treat all Catalysts and Seekers with respect. Harassment or abusive behavior will result in immediate account termination.
                                </li>
                                <li>
                                    <strong className="text-text-primary">Authenticity:</strong> You must provide accurate information. Fake profiles or impersonation are strictly prohibited.
                                </li>
                                <li>
                                    <strong className="text-text-primary">Platform Payments:</strong> All bookings and payments must be conducted through the Mattter platform to ensure safety and security for both parties.
                                </li>
                                <li>
                                    <strong className="text-text-primary">Content Guidelines:</strong> Do not upload offensive or inappropriate content (images, bios, messages).
                                </li>
                                <li>
                                    <strong className="text-text-primary">Public Visibility:</strong> All images and media you upload (including profile photos and wardrobe items) will be publicly accessible. Please be careful and do not upload sensitive personal information.
                                </li>
                                <li>
                                    <strong className="text-text-primary">Account Suspension:</strong> We reserve the right to suspend or ban accounts that violate these rules without prior notice.
                                </li>
                            </ul>

                            <p className="mt-4 text-xs text-text-muted">Last updated: December 2025</p>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    setTermsAccepted(true);
                                    setShowTermsModal(false);
                                }}
                                className="w-full py-3 bg-dark-elevated hover:bg-accent-blue hover:text-white text-text-primary rounded-lg font-medium transition-all"
                            >
                                I Understand & Agree
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Register;
