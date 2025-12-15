import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import SeekerDashboard from './pages/SeekerDashboard';
import CatalystDashboard from './pages/CatalystDashboard';
import CatalystSearch from './pages/CatalystSearch';
import CatalystProfile from './pages/CatalystProfile';
import YourCatalysts from './pages/YourCatalysts';
import Login from './pages/Login';
import Register from './pages/Register';
import SeekerOnboarding from './pages/SeekerOnboarding';
import AdminDashboard from './pages/AdminDashboard';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/onboarding" element={
                        <ProtectedRoute>
                            <SeekerOnboarding />
                        </ProtectedRoute>
                    } />

                    {/* Admin Route - Isolated from Main Layout */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['ADMIN']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />

                    <Route path="/" element={<Layout />}>
                        <Route index element={<LandingPage />} />
                        <Route path="seeker" element={
                            <ProtectedRoute allowedRoles={['SEEKER']}>
                                <SeekerDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="catalyst" element={
                            <ProtectedRoute allowedRoles={['CATALYST']}>
                                <CatalystDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="search" element={
                            <ProtectedRoute>
                                <CatalystSearch />
                            </ProtectedRoute>
                        } />
                        <Route path="catalysts" element={
                            <ProtectedRoute allowedRoles={['SEEKER']}>
                                <YourCatalysts />
                            </ProtectedRoute>
                        } />
                        <Route path="catalyst/:id" element={
                            <ProtectedRoute>
                                <CatalystProfile />
                            </ProtectedRoute>
                        } />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
