import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-dark-bg">
                <div className="w-12 h-12 border-4 border-accent-purple/30 border-t-accent-purple rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'SEEKER') return <Navigate to="/seeker" replace />;
        if (user.role === 'CATALYST') return <Navigate to="/catalyst" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
