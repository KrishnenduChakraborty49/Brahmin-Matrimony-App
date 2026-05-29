import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Placeholder Pages
const Home = () => <div className="p-8 text-center"><h1 className="text-4xl font-bold text-matrimony-600">Welcome to BrahminMilan</h1><p className="mt-4">The most trusted matrimony platform.</p></div>;
const Login = () => <div className="p-8 text-center"><h2>Login Page</h2></div>;
const Dashboard = () => <div className="p-8 text-center"><h2>User Dashboard</h2></div>;

const PrivateRoute = ({ children }) => {
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <div className="text-2xl font-bold text-matrimony-600">BrahminMilan</div>
                    <div>
                        <a href="/" className="px-4 text-gray-600 hover:text-matrimony-600">Home</a>
                        <a href="/login" className="px-4 text-gray-600 hover:text-matrimony-600">Login</a>
                    </div>
                </nav>
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    </Routes>
                </main>
                <footer className="bg-gray-800 text-white p-4 text-center">
                    &copy; {new Date().getFullYear()} BrahminMilan. All rights reserved.
                </footer>
            </div>
        </Router>
    );
};

export default AppRouter;
