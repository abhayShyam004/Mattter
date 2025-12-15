import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import { Link, useNavigate } from 'react-router-dom';
import {
    Users, Star, Activity, AlertTriangle, Trash2, Search,
    X, CheckCircle, ChevronRight, Filter, ChevronDown, User, Calendar,
    LayoutDashboard, LogOut, Menu, Sparkles
} from 'lucide-react';

// --- Components ---

const UserDetailModal = ({ user, onClose, onDelete }) => {
    const [previewImage, setPreviewImage] = useState(null);

    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Image Preview Modal Overlay */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        onClick={() => setPreviewImage(null)}
                        className="absolute top-4 right-4 p-2 text-white hover:text-accent-pink transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-dark-elevated rounded-full text-text-secondary hover:text-white hover:bg-dark-border transition-colors animate-pulse"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-accent-purple/20">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-text-primary mb-1">{user.name || 'Unknown User'}</h2>
                            <div className="flex items-center space-x-2 text-text-secondary">
                                <span className="px-2 py-0.5 rounded-md bg-dark-elevated text-xs font-medium uppercase tracking-wider">{user.role || 'User'}</span>
                                <span>•</span>
                                <span>{user.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <p className="text-text-secondary text-xs mb-1">Joined</p>
                            <p className="font-semibold text-text-primary text-sm">
                                {new Date(user.joined_at || Date.now()).toLocaleDateString('en-GB')}
                            </p>
                        </div>
                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <p className="text-text-secondary text-xs mb-1">Status</p>
                            <div className="flex items-center space-x-1 text-green-400">
                                <CheckCircle className="w-3 h-3" />
                                <span className="font-semibold text-sm">Active</span>
                            </div>
                        </div>
                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <p className="text-text-secondary text-xs mb-1">Bookings</p>
                            <p className="font-semibold text-text-primary text-sm">{user.booking_count || 0}</p>
                        </div>
                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <p className="text-text-secondary text-xs mb-1">Reports</p>
                            <p className={`font-semibold text-sm ${user.report_count > 0 ? 'text-red-400' : 'text-text-primary'}`}>
                                {user.report_count || 0}
                            </p>
                        </div>
                    </div>

                    {/* Tabs / Sections */}
                    <div className="space-y-6">

                        {/* Loading State */}
                        {user.loadingDetails && (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-3 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
                            </div>
                        )}


                        {/* Status indicators */}
                        {/* Portfolio Images (Catalysts only) */}
                        {!user.loadingDetails && user.portfolio_images && user.portfolio_images.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                                    <Sparkles className="w-5 h-5 text-accent-gold mr-2" />
                                    Portfolio
                                </h3>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                    {user.portfolio_images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setPreviewImage(img)}
                                            className="group relative aspect-square rounded-lg overflow-hidden border border-dark-border cursor-pointer hover:border-accent-purple transition-all"
                                        >
                                            <img
                                                src={img}
                                                alt={`Portfolio ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Search className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Reports Section (if any) */}
                        {!user.loadingDetails && user.reports && user.reports.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                                    <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                                    Reports Against Usage
                                </h3>
                                <div className="space-y-3">
                                    {user.reports.map(report => (
                                        <div key={report.id} className="bg-red-900/10 border border-red-900/30 p-4 rounded-xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-red-400 font-medium text-sm">Reason: {report.reason}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${report.status === 'RESOLVED' ? 'bg-green-900/20 text-green-400' : 'bg-yellow-900/20 text-yellow-400'}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <p className="text-text-secondary text-xs">
                                                Reported by {report.reporter_name} on {new Date(report.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Match History */}
                        {!user.loadingDetails && user.matches && user.matches.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                                    <Activity className="w-5 h-5 text-accent-blue mr-2" />
                                    Match History
                                </h3>
                                <div className="bg-dark-elevated rounded-xl overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-dark-border/30 text-text-secondary font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Counterpart</th>
                                                <th className="px-4 py-3">Service</th>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-dark-border/50">
                                            {user.matches.map((match) => (
                                                <tr key={match.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-text-primary">{match.other_party_name}</td>
                                                    <td className="px-4 py-3 text-text-secondary">{match.service}</td>
                                                    <td className="px-4 py-3 text-text-secondary">{new Date(match.date).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <span className="px-2 py-1 bg-green-900/20 text-green-400 rounded text-xs">
                                                            {match.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-8 border-t border-dark-border flex justify-end space-x-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:text-white transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onDelete(user.user_id)}
                            className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all flex items-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ReportDetailModal = ({ report, onClose, onResolve }) => {
    if (!report) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-dark-surface border border-dark-border rounded-2xl w-full max-w-lg relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-dark-elevated rounded-full text-text-secondary hover:text-white hover:bg-dark-border transition-colors animate-pulse"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary">Report Details</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1 block">Reporter</label>
                            <div className="flex items-center text-text-primary">
                                <User className="w-4 h-4 mr-2 text-accent-purple" />
                                {report.reporter_name || 'Unknown'}
                            </div>
                        </div>

                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1 block">Reported User</label>
                            <div className="flex items-center text-text-primary">
                                <User className="w-4 h-4 mr-2 text-accent-pink" />
                                {report.reported_user_name || 'Unknown'}
                            </div>
                        </div>

                        <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border">
                            <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1 block">Reason</label>
                            <p className="text-text-primary mt-1">{report.reason}</p>
                        </div>

                        <div className="flex justify-between gap-4">
                            <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border flex-1">
                                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1 block">Status</label>
                                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${report.status === 'RESOLVED' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                    }`}>
                                    {report.status}
                                </span>
                            </div>
                            <div className="bg-dark-elevated p-4 rounded-xl border border-dark-border flex-1">
                                <label className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-1 block">Date</label>
                                <p className="text-text-primary text-sm flex items-center mt-1">
                                    <Calendar className="w-3 h-3 mr-1.5 text-text-secondary" />
                                    {new Date(report.created_at).toLocaleDateString('en-GB')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-dark-elevated rounded-lg transition-colors"
                        >
                            Close
                        </button>
                        {report.status !== 'RESOLVED' && (
                            <button
                                onClick={() => onResolve(report.id)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow-lg shadow-green-900/20 transition-all flex items-center"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const SidebarItem = ({ icon: Icon, label, active, onClick, isDanger }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 border ${active
            ? 'bg-gradient-to-r from-accent-purple/20 to-accent-pink/5 text-accent-purple border-accent-purple/20 shadow-lg shadow-accent-purple/5'
            : isDanger
                ? 'text-red-400 hover:bg-red-500/10 border-transparent'
                : 'text-text-secondary hover:text-text-primary hover:bg-white/5 border-transparent'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-accent-purple' : isDanger ? 'text-red-400' : 'text-text-secondary'}`} />
        <span className={`font-medium ${active ? 'text-white' : ''}`}>{label}</span>
    </button>
);


const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, userName, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-dark-surface border border-red-500/30 rounded-2xl w-full max-w-md relative overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Delete User?</h3>
                            <p className="text-text-secondary text-sm">This action cannot be undone.</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <p className="text-text-secondary">
                            Are you sure you want to permanently delete <span className="font-bold text-white">{userName}</span>?
                            All associated data including bookings, messages, and profile information will be removed immediately.
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2 text-text-secondary hover:text-white hover:bg-dark-elevated rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg shadow-red-900/20 transition-all disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete User</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Page ---

const AdminDashboard = () => {
    const { token, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ catalysts: [], seekers: [] });
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'catalysts', 'seekers', 'reports'
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    // Debounce Search Term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    // Modal States
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);

    // Delete Confirmation State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initial Fetch
    useEffect(() => {
        fetchDashboardData();
    }, [token]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch Stats and Users
            const statsRes = await axios.get(`${API_BASE_URL}/api/admin-data/dashboard_stats/`);
            setStats(statsRes.data);

            // Fetch Reports
            const reportsRes = await axios.get(`${API_BASE_URL}/api/reports/`);
            setReports(reportsRes.data);

        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        // Optimistic UI: Pre-fill with available data from stats
        const baseInfo = [...stats.catalysts, ...stats.seekers].find(u => u.user_id === userId) || {};
        const isCatalyst = stats.catalysts.some(c => c.user_id === userId);

        setSelectedUser({
            ...baseInfo,
            role: baseInfo.role || (isCatalyst ? 'CATALYST' : 'SEEKER'),
            loadingDetails: true,
            reports: [],
            matches: []
        });
        setShowUserModal(true);

        try {
            const response = await axios.get(`${API_BASE_URL}/api/admin-data/user_details/?user_id=${userId}`);
            if (response.data.success) {
                setSelectedUser(prev => ({
                    ...prev,
                    ...response.data.profile,
                    reports: response.data.reports,
                    matches: response.data.matches,
                    role: response.data.profile.role,
                    loadingDetails: false
                }));
            }
        } catch (err) {
            console.error("Error fetching user details", err);
            // Don't close modal, just stop loading and maybe show previous data or empty state
            setSelectedUser(prev => ({ ...prev, loadingDetails: false }));
        }
    };

    const handleDeleteUser = (userId) => {
        // Find user name for the modal
        const user = [...stats.catalysts, ...stats.seekers].find(u => u.user_id === userId);
        setUserToDelete({ id: userId, name: user?.name || 'Unknown User' });
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            await axios.delete(`${API_BASE_URL}/api/admin-data/delete_user/?user_id=${userToDelete.id}`);

            // Optimistically remove user from local state to avoid full reload
            setStats(prev => ({
                ...prev,
                catalysts: prev.catalysts.filter(u => u.user_id !== userToDelete.id),
                seekers: prev.seekers.filter(u => u.user_id !== userToDelete.id)
            }));

            setShowUserModal(false);
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete user. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleResolveReport = async (reportId) => {
        try {
            await axios.patch(`${API_BASE_URL}/api/reports/${reportId}/`, {
                status: 'RESOLVED'
            });
            // Update local state directly for speed
            setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'RESOLVED' } : r));
            setShowReportModal(false);
        } catch (err) {
            console.error("Resolve failed", err);
            alert("Failed to resolve report.");
        }
    };

    // Filter Logic
    const filteredCatalysts = React.useMemo(() => {
        return stats.catalysts.filter(c =>
            c.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [stats.catalysts, debouncedSearchTerm]);

    const filteredSeekers = React.useMemo(() => {
        return stats.seekers.filter(s =>
            s.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [stats.seekers, debouncedSearchTerm]);

    const filteredReports = React.useMemo(() => {
        return reports.filter(r =>
            (r.reporter_name && r.reporter_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
            (r.reason && r.reason.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
        );
    }, [reports, debouncedSearchTerm]);


    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary flex">

            {/* Sidebar Overlay (Mobile) */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:sticky top-0 h-screen w-64 bg-dark-surface border-r border-dark-border z-50 transition-transform duration-300 ease-in-out
                ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col p-6">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 mb-10">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent-purple to-accent-pink rounded-lg flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-accent-purple via-accent-pink to-accent-gold bg-clip-text text-transparent">
                            Mattter
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-2">
                        <SidebarItem
                            icon={LayoutDashboard}
                            label="Overview"
                            active={activeTab === 'overview'}
                            onClick={() => { setActiveTab('overview'); setMobileSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={Star}
                            label="Catalysts"
                            active={activeTab === 'catalysts'}
                            onClick={() => { setActiveTab('catalysts'); setMobileSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={Users}
                            label="Seekers"
                            active={activeTab === 'seekers'}
                            onClick={() => { setActiveTab('seekers'); setMobileSidebarOpen(false); }}
                        />
                        <SidebarItem
                            icon={AlertTriangle}
                            label="Reports"
                            active={activeTab === 'reports'}
                            onClick={() => { setActiveTab('reports'); setMobileSidebarOpen(false); }}
                        />
                    </nav>

                    {/* Bottom Actions */}
                    <div className="pt-6 border-t border-dark-border">
                        <SidebarItem
                            icon={LogOut}
                            label="Logout"
                            isDanger
                            onClick={handleLogout}
                        />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 md:pl-0">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-dark-border bg-dark-bg sticky top-0 z-30">
                    <button
                        onClick={() => setMobileSidebarOpen(true)}
                        className="p-2 text-text-secondary hover:text-white"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-lg">Admin Dashboard</span>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
                            <p className="text-text-secondary mt-1">Manage platform activity</p>
                        </div>

                        {activeTab !== 'overview' && (
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder={`Search ${activeTab}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-dark-surface border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent-purple transition-colors"
                                />
                            </div>
                        )}
                    </div>

                    {/* OVERVIEW CONTENT */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary text-sm">Total Catalysts</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.catalysts.length}</h3>
                                    </div>
                                    <div className="p-3 bg-accent-purple/10 rounded-xl">
                                        <Star className="w-6 h-6 text-accent-purple" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary text-sm">Total Seekers</p>
                                        <h3 className="text-3xl font-bold mt-2">{stats.seekers.length}</h3>
                                    </div>
                                    <div className="p-3 bg-accent-blue/10 rounded-xl">
                                        <Users className="w-6 h-6 text-accent-blue" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary text-sm">Active Reports</p>
                                        <h3 className="text-3xl font-bold mt-2 text-red-400">
                                            {reports.filter(r => r.status === 'PENDING').length}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-red-500/10 rounded-xl">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-text-secondary text-sm">Total Bookings</p>
                                        <h3 className="text-3xl font-bold mt-2">
                                            {stats.seekers.reduce((acc, curr) => acc + (curr.booking_count || 0), 0)}
                                        </h3>
                                    </div>
                                    <div className="p-3 bg-accent-gold/10 rounded-xl">
                                        <Activity className="w-6 h-6 text-accent-gold" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CATALYSTS CONTENT */}
                    {activeTab === 'catalysts' && (
                        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-elevated text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4">Catalyst</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Email</th>
                                            <th className="px-6 py-4">Rating</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {filteredCatalysts.map(cat => (
                                            <tr key={cat.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fetchUserDetails(cat.user_id)}>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-text-primary">{cat.name}</div>
                                                    <div className="text-xs text-text-secondary md:hidden">{cat.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary hidden md:table-cell">{cat.email}</td>
                                                <td className="px-6 py-4 flex items-center">
                                                    <Star className="w-4 h-4 text-accent-gold fill-accent-gold mr-1" />
                                                    <span className="font-medium">{cat.average_rating || 0}</span>
                                                    <span className="text-text-secondary text-xs ml-1">({cat.rating_count})</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* SEEKERS CONTENT */}
                    {activeTab === 'seekers' && (
                        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-elevated text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4">Seeker</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Email</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Joined</th>
                                            <th className="px-6 py-4">Bookings</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {filteredSeekers.map(seeker => (
                                            <tr key={seeker.id} className="hover:bg-white/5 transition-colors cursor-pointer" onClick={() => fetchUserDetails(seeker.user_id)}>
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-text-primary">{seeker.name}</div>
                                                    <div className="text-xs text-text-secondary md:hidden">{seeker.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary hidden md:table-cell">{seeker.email}</td>
                                                <td className="px-6 py-4 text-text-secondary hidden md:table-cell">
                                                    {new Date(seeker.joined_at).toLocaleDateString('en-GB')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-blue/10 text-accent-blue">
                                                        {seeker.booking_count}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* REPORTS CONTENT */}
                    {activeTab === 'reports' && (
                        <div className="bg-dark-surface rounded-2xl border border-dark-border overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-dark-elevated text-text-secondary text-xs uppercase tracking-wider font-semibold border-b border-dark-border">
                                        <tr>
                                            <th className="px-6 py-4">Reporter</th>
                                            <th className="px-6 py-4">Reported User</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Reason</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Status</th>
                                            <th className="px-6 py-4 hidden md:table-cell">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-border">
                                        {filteredReports.map(report => (
                                            <tr
                                                key={report.id}
                                                className="hover:bg-white/5 transition-colors cursor-pointer"
                                                onClick={() => { setSelectedReport(report); setShowReportModal(true); }}
                                            >
                                                <td className="px-6 py-4 font-medium text-text-primary">{report.reporter_name}</td>
                                                <td className="px-6 py-4 text-text-primary">{report.reported_user_name || 'Unknown'}</td>
                                                <td className="px-6 py-4 text-text-secondary hidden md:table-cell max-w-xs truncate">{report.reason}</td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'RESOLVED' ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                                        }`}>
                                                        {report.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary hidden md:table-cell">
                                                    {new Date(report.created_at).toLocaleDateString('en-GB')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* Modals */}
            {showUserModal && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => setShowUserModal(false)}
                    onDelete={handleDeleteUser}
                />
            )}

            {showReportModal && (
                <ReportDetailModal
                    report={selectedReport}
                    onClose={() => setShowReportModal(false)}
                    onResolve={handleResolveReport}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                userName={userToDelete?.name}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default AdminDashboard;
