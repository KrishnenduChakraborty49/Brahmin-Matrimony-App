import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { User, Users, Heart, Star, MessageCircle, Bell, Sparkles, Camera, Loader, CheckCircle, Clock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfileAndPhotos = async () => {
    try {
      const profileRes = await api.get('/profiles/me');
      if (profileRes.data) {
        setProfile(profileRes.data);
      }
    } catch (err) {
      console.log('No profile found yet or error loading profile:', err);
    }

    try {
      const photosRes = await api.get('/profiles/me/photos');
      setPhotos(photosRes.data || []);
    } catch (err) {
      console.log('No photos found or error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPhotos();
  }, []);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'PROFILE');

    try {
      await api.post('/profiles/me/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Photo uploaded successfully! Pending admin approval.');
      // Refresh data
      fetchProfileAndPhotos();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to upload photo. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 10;
    const fields = ['fullName', 'gender', 'dob', 'maritalStatus', 'subCaste', 'motherTongue', 'location', 'education', 'occupation', 'aboutMe'];
    const filled = fields.filter(field => !!profile[field]);
    return Math.round((filled.length / fields.length) * 100);
  };

  const completion = getCompletionPercentage();

  // Find first approved profile photo, otherwise fallback to null
  const approvedProfilePhoto = photos.find(p => p.type === 'PROFILE' && (p.approved || p.isApproved));
  const avatarUrl = approvedProfilePhoto ? approvedProfilePhoto.url : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    );
  }

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
        {message && (
          <div className="mb-6 bg-slate-900 border-l-4 border-matrimony-500 text-white p-4 rounded-xl text-sm font-medium shadow-md flex justify-between items-center animate-in fade-in slide-in-from-top-4">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - User Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:col-span-1 flex flex-col items-center">
            
            {/* Avatar Container with upload icon overlay */}
            <div className="relative group w-32 h-32 mb-4">
              <div className="w-full h-full bg-gray-105 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative">
                 {avatarUrl ? (
                   <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                 ) : (
                   <User className="w-16 h-16 text-gray-400" />
                 )}
                 {uploading && (
                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                     <Loader className="w-6 h-6 animate-spin" />
                   </div>
                 )}
              </div>
              
              <label className="absolute bottom-0 right-0 bg-matrimony-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-matrimony-700 transition shadow-md hover:scale-105 active:scale-95">
                <Camera className="w-4 h-4" />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  disabled={uploading}
                />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900 text-center mt-2">
              {profile?.fullName || user?.email || 'New Member'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">Profile ID: #BM100{profile?.id || '---'}</p>
            
            <Link to="/profile/edit" className="w-full text-center py-2.5 px-4 border border-matrimony-600 text-matrimony-600 rounded-xl hover:bg-matrimony-50 font-bold transition">
              {profile ? 'Edit Profile' : 'Complete Profile'}
            </Link>

            {/* Profile Completion details */}
            <div className="w-full mt-6 pt-6 border-t border-gray-100">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-bold text-matrimony-600">{completion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-matrimony-500 h-2.5 rounded-full" style={{ width: `${completion}%` }}></div>
                </div>
              </div>
            </div>

            {/* User Photos List Grid */}
            {photos.length > 0 && (
              <div className="w-full mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-3 text-left">My Photo Gallery</h3>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map(p => (
                    <div key={p.id} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-100 group">
                      <img src={p.url} alt="Uploaded" className="w-full h-full object-cover" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[9px] text-white py-0.5 text-center font-bold tracking-wider">
                        {(p.approved || p.isApproved) ? (
                          <span className="text-green-400">Approved</span>
                        ) : (
                          <span className="text-amber-400">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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
                {completion < 50 ? (
                  <>
                    <h4 className="text-lg font-medium text-gray-900">Complete your profile to see matches</h4>
                    <p className="text-gray-500 mt-2 max-w-sm">We need more information about you to find the most compatible matches in the community.</p>
                    <Link to="/profile/edit" className="mt-6 px-6 py-2 bg-matrimony-600 text-white rounded-full font-medium hover:bg-matrimony-700 transition shadow-sm">
                      Update Profile Now
                    </Link>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-medium text-gray-900">No matches found matching your criteria</h4>
                    <p className="text-gray-500 mt-2 max-w-sm">Try broadening your partner preferences or explore matches in other areas.</p>
                    <Link to="/search" className="mt-6 px-6 py-2 bg-matrimony-600 text-white rounded-full font-medium hover:bg-matrimony-700 transition shadow-sm">
                      Explore Members
                    </Link>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
