import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        gender: '',
        age: '',
        role: 'SEEKER'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(formData);
            navigate(formData.role === 'SEEKER' ? '/onboarding' : '/catalyst');
        } catch (err) {
            setError('Registration failed. Username might be taken.');
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

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-blue to-accent-gold text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-blue/50 transition-all transform hover:scale-105"
                        >
                            <UserPlus className="w-5 h-5" />
                            <span>Create Account</span>
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
        </div>
    );
};

export default Register;
