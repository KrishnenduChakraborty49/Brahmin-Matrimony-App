import React from 'react';
import { useSelector } from 'react-redux';
import { User, Users, Heart, Star, Settings, MessageCircle, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Banner */}
      <div className="bg-matrimony-700 pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-white">
            <h1 className="text-3xl font-bold">My Dashboard</h1>
            <div className="flex space-x-4">
              <button className="p-2 bg-matrimony-600 rounded-full hover:bg-matrimony-500 transition relative">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-matrimony-700"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - User Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
            <div className="flex flex-col items-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mb-4 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                 {/* Placeholder for Profile Picture */}
                 <User className="w-16 h-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{user?.name || 'New Member'}</h2>
              <p className="text-sm text-gray-500 mb-4">Profile ID: #BM100452</p>
              
              <Link to="/profile/edit" className="w-full text-center py-2 px-4 border border-matrimony-600 text-matrimony-600 rounded-lg hover:bg-matrimony-50 font-medium transition">
                Complete Profile
              </Link>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-bold text-matrimony-600">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-matrimony-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content - Stats & Actions */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Interests</span>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Shortlisted</span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Messages</span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">0</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Profile Views</span>
              </div>
            </div>

            {/* Recommended Matches Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recommended Matches</h3>
                <Link to="/search" className="text-sm font-medium text-matrimony-600 hover:text-matrimony-700">View All</Link>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
                <h4 className="text-lg font-medium text-gray-900">Complete your profile to see matches</h4>
                <p className="text-gray-500 mt-2 max-w-sm">We need more information about you to find the most compatible matches in the community.</p>
                <Link to="/profile/edit" className="mt-6 px-6 py-2 bg-matrimony-600 text-white rounded-full font-medium hover:bg-matrimony-700 transition shadow-sm">
                  Update Profile Now
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
