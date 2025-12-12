import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-dark-bg">
            <header className="bg-dark-surface border-b border-dark-border backdrop-blur-lg bg-opacity-80 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2 group" onClick={closeMobileMenu}>
                            <div className="w-10 h-10 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                                Mattter
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
                            {user ? (
                                <>
                                    {user.role === 'SEEKER' && (
                                        <>
                                            <Link
                                                to="/seeker"
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/search"
                                                className="text-text-secondary hover:text-text-primary transition-colors"
                                            >
                                                Discover
                                            </Link>
                                        </>
                                    )}
                                    {user.role === 'CATALYST' && (
                                        <Link
                                            to="/catalyst"
                                            className="text-text-secondary hover:text-text-primary transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-2 bg-dark-elevated hover:bg-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-all"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="text-text-secondary hover:text-text-primary transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 lg:px-6 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <nav className="md:hidden mt-4 pb-4 border-t border-dark-border pt-4 space-y-3">
                            {user ? (
                                <>
                                    {user.role === 'SEEKER' && (
                                        <>
                                            <Link
                                                to="/seeker"
                                                onClick={closeMobileMenu}
                                                className="block text-text-secondary hover:text-text-primary transition-colors py-2"
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                to="/search"
                                                onClick={closeMobileMenu}
                                                className="block text-text-secondary hover:text-text-primary transition-colors py-2"
                                            >
                                                Discover
                                            </Link>
                                        </>
                                    )}
                                    {user.role === 'CATALYST' && (
                                        <Link
                                            to="/catalyst"
                                            onClick={closeMobileMenu}
                                            className="block text-text-secondary hover:text-text-primary transition-colors py-2"
                                        >
                                            Dashboard
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center space-x-2 px-4 py-2 bg-dark-elevated hover:bg-dark-border rounded-lg text-text-secondary hover:text-text-primary transition-all w-full"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={closeMobileMenu}
                                        className="block text-text-secondary hover:text-text-primary transition-colors py-2"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={closeMobileMenu}
                                        className="block px-6 py-2 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-lg font-medium hover:shadow-lg hover:shadow-accent-purple/50 transition-all text-center"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>
                    )}
                </div>
            </header>

            <main className="flex-grow">
                <Outlet />
            </main>

            <footer className="bg-dark-surface border-t border-dark-border py-8">
                <div className="container mx-auto px-4 sm:px-6 text-center text-text-muted text-sm">
                    &copy; 2026 Mattter. Elevate your style.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
