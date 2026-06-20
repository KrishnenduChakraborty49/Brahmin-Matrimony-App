import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut } from 'lucide-react';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProfileForm from './pages/ProfileForm';
import SearchProfiles from './pages/SearchProfiles';
import ChatWindow from './pages/ChatWindow';
import SubscriptionPlans from './pages/SubscriptionPlans';
import AdminDashboard from './pages/AdminDashboard';
import InterestsShortlist from './pages/InterestsShortlist';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    const user = useSelector(state => state.auth.user);
    const isAdmin = user && user.roles && user.roles.includes('ROLE_ADMIN');
    const dispatch = useDispatch();

    const handleLogout = () => {
      dispatch({ type: 'LOGOUT' });
    };

    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
                <nav className="bg-white shadow-sm p-4 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div className="text-2xl font-extrabold text-matrimony-600 tracking-tight">
                            Brahmin<span className="text-gray-900">Milan</span>
                        </div>
                        <div className="flex items-center space-x-6">
                            <a href="/" className="text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">Home</a>
                            {!isAuthenticated ? (
                                <>
                                  <a href="/login" className="text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">Login</a>
                                  <a href="/register" className="px-5 py-2 bg-matrimony-600 text-white rounded-full text-sm font-bold hover:bg-matrimony-700 transition shadow-sm hover:shadow-md">Register Free</a>
                                </>
                            ) : (
                                <>
                                  <a href="/dashboard" className="text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">Dashboard</a>
                                  <a href="/search" className="text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">Matches</a>
                                  <a href="/chat" className="text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">Chat</a>
                                  <a href="/upgrade" className="text-sm font-medium text-yellow-600 hover:text-yellow-700 transition">Upgrade</a>
                                  {isAdmin && (
                                    <a href="/admin" className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition">Admin</a>
                                  )}
                                  <button onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-600 hover:text-matrimony-600 transition">
                                    <LogOut className="w-4 h-4 mr-1" /> Logout
                                  </button>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/profile/edit" element={<PrivateRoute><ProfileForm /></PrivateRoute>} />
                        <Route path="/search" element={<PrivateRoute><SearchProfiles /></PrivateRoute>} />
                        <Route path="/chat" element={<PrivateRoute><ChatWindow /></PrivateRoute>} />
                        <Route path="/interests" element={<PrivateRoute><InterestsShortlist /></PrivateRoute>} />
                        <Route path="/shortlisted" element={<PrivateRoute><InterestsShortlist /></PrivateRoute>} />
                        <Route path="/upgrade" element={<PrivateRoute><SubscriptionPlans /></PrivateRoute>} />
                        <Route path="/admin" element={<PrivateRoute>{isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" />}</PrivateRoute>} />
                    </Routes>
                </main>
                <footer className="bg-gray-900 text-gray-400 py-12">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <div className="text-2xl font-bold text-white mb-4">BrahminMilan</div>
                        <p className="mb-6 max-w-md mx-auto">Connecting hearts across the Brahmin community with trust, authenticity, and care.</p>
                        <div className="border-t border-gray-800 pt-8">
                           &copy; {new Date().getFullYear()} BrahminMilan. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </Router>
    );
};

export default AppRouter;
