import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Sparkles } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const userData = await login(username, password);
            console.log('Login userData:', userData);

            // Redirect based on user role/permissions
            if (userData.is_staff || userData.is_superuser) {
                navigate('/admin');
            } else if (userData.role === 'CATALYST') {
                navigate('/catalyst');
            } else {
                navigate('/seeker');
            }
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Invalid username or password');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-dark-bg relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent-purple/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-pink/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Logo */}
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-accent-purple to-accent-pink rounded-2xl flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-text-secondary">
                        Sign in to continue your style journey
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
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple transition-all"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-dark-elevated border border-dark-border rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-purple/50 focus:border-accent-purple transition-all"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all transform hover:scale-105 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-text-muted text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-accent-purple hover:text-accent-pink transition-colors font-medium">
                                Create one
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
