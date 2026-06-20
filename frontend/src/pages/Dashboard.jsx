import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { User, Users, Heart, Star, MessageCircle, Bell, Sparkles, Camera, Loader, CheckCircle, Clock, X, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Dashboard Stats State
  const [stats, setStats] = useState({ interests: 0, shortlisted: 0, messages: 0, profileViews: 15 });
  
  // Recommended Matches State
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [connectingId, setConnectingId] = useState(null);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [sentInterestsIds, setSentInterestsIds] = useState(new Set());

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    }

    // Fetch dynamic stats
    try {
      const statsRes = await api.get('/profiles/me/dashboard-stats');
      if (statsRes.data) {
        setStats({
          interests: statsRes.data.interests || 0,
          shortlisted: statsRes.data.shortlisted || 0,
          messages: statsRes.data.messages || 0,
          profileViews: statsRes.data.profileViews || 15
        });
      }
    } catch (err) {
      console.log('Error loading stats:', err);
    }

    // Fetch recommended matches
    try {
      setLoadingMatches(true);
      const matchesRes = await api.get('/profiles');
      setMatches((matchesRes.data || []).slice(0, 3)); // Display top 3 recommendations
    } catch (err) {
      console.log('Error loading recommended matches:', err);
    } finally {
      setLoadingMatches(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndPhotos();
  }, []);

  // Fetch notifications and connect to STOMP WebSocket
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const notifRes = await api.get('/notifications');
        setNotifications(notifRes.data || []);
        
        const countRes = await api.get('/notifications/unread-count');
        setUnreadCount(countRes.data || 0);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };
    fetchNotifications();

    const socketUrl = 'http://localhost:8080/ws';
    const socket = new SockJS(socketUrl);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},
      onConnect: () => {
        console.log('Dashboard connected to WebSocket broker');
        client.subscribe(`/user/${user.id}/queue/notifications`, (msg) => {
          if (msg.body) {
            const newNotif = JSON.parse(msg.body);
            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            // Refresh stats to capture any new interest counts
            fetchStatsOnly();
          }
        });
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [user]);

  const fetchStatsOnly = async () => {
    try {
      const statsRes = await api.get('/profiles/me/dashboard-stats');
      if (statsRes.data) {
        setStats({
          interests: statsRes.data.interests || 0,
          shortlisted: statsRes.data.shortlisted || 0,
          messages: statsRes.data.messages || 0,
          profileViews: statsRes.data.profileViews || 15
        });
      }
    } catch (err) {
      console.log('Error reloading stats:', err);
    }
  };

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

  const handleConnect = async (match) => {
    setConnectingId(match.userId);
    try {
      await api.post(`/matchmaking/interests/send/${match.userId}`);
      setSentInterestsIds(prev => {
        const next = new Set(prev);
        next.add(match.userId);
        return next;
      });
      // Refresh stats
      fetchStatsOnly();
    } catch (err) {
      console.error('Failed to connect:', err);
      setMessage(err.response?.data?.message || 'Could not send interest. Please try again.');
    } finally {
      setConnectingId(null);
    }
  };

  const handleShortlist = async (match) => {
    try {
      await api.post(`/matchmaking/shortlist/${match.id}`);
      setShortlistedIds(prev => {
        const next = new Set(prev);
        next.add(match.id);
        return next;
      });
      // Refresh stats
      fetchStatsOnly();
    } catch (err) {
      console.error('Failed to shortlist:', err);
      setMessage(err.response?.data?.message || 'Could not shortlist profile.');
    }
  };

  const handleStartChat = async (match) => {
    try {
      const res = await api.post(`/chat/init/${match.userId}`);
      navigate(`/chat?chatId=${res.data.id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const handleMarkAsRead = async (notif) => {
    if (notif.isRead || notif.read) return;
    try {
      await api.put(`/notifications/${notif.id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notif.id ? { ...n, isRead: true, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getCompletionPercentage = () => {
    if (!profile) return 10;
    const fields = ['fullName', 'gender', 'dob', 'maritalStatus', 'subCaste', 'motherTongue', 'location', 'education', 'occupation', 'aboutMe'];
    const filled = fields.filter(field => !!profile[field]);
    return Math.round((filled.length / fields.length) * 100);
  };

  const formatTimeAgo = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
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
            
            {/* Notifications Icon and Dropdown */}
            <div className="flex space-x-4 relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-matrimony-600 rounded-full hover:bg-matrimony-500 transition relative"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-matrimony-700 flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-950 text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-matrimony-600 hover:text-matrimony-750 font-bold transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-2">
                        <Bell className="w-8 h-8 text-gray-300" />
                        <span>No new notifications</span>
                      </div>
                    ) : (
                      notifications.map(notif => {
                        const isRead = notif.isRead || notif.read;
                        return (
                          <div 
                            key={notif.id} 
                            onClick={() => handleMarkAsRead(notif)}
                            className={`p-4 transition cursor-pointer flex gap-3 items-start ${isRead ? 'hover:bg-gray-50/50' : 'bg-matrimony-50/40 hover:bg-matrimony-50/80'}`}
                          >
                            <div className="flex-grow min-w-0">
                              <p className={`text-xs text-gray-800 break-words ${isRead ? 'font-normal' : 'font-semibold'}`}>
                                {notif.content}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                            {!isRead && (
                              <span className="w-2 h-2 rounded-full bg-matrimony-600 mt-1 flex-shrink-0"></span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
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
              <div className="w-full h-full bg-gray-100 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden relative">
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
              <div 
                onClick={() => navigate('/interests?tab=received')}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mb-3">
                  <Heart className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.interests}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Interests</span>
              </div>
              
              <div 
                onClick={() => navigate('/shortlisted?tab=shortlist')}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.shortlisted}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Shortlisted</span>
              </div>

              <div 
                onClick={() => navigate('/chat')}
                className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md cursor-pointer transition"
              >
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.messages}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Messages</span>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 flex flex-col items-center justify-center hover:shadow-md transition">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-2xl font-bold text-gray-900">{stats.profileViews}</span>
                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Profile Views</span>
              </div>
            </div>

            {/* Recommended Matches Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recommended Matches</h3>
                <Link to="/search" className="text-sm font-medium text-matrimony-600 hover:text-matrimony-700">View All</Link>
              </div>
              
              {loadingMatches ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-8 h-8 text-matrimony-600 animate-spin" />
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matches.map((match) => {
                    const isShortlisted = shortlistedIds.has(match.id);
                    const isInterestSent = sentInterestsIds.has(match.userId);
                    const isConnecting = connectingId === match.userId;

                    const matchPhoto = match.photoUrls && match.photoUrls.length > 0
                      ? match.photoUrls[0]
                      : match.photoUrl || (match.gender === 'FEMALE'
                        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80');

                    return (
                      <div key={match.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
                        <div className="relative h-44 bg-gray-200">
                          <img src={matchPhoto} alt={match.fullName} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-matrimony-600 text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                            {match.matchScore}% Match
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                          <h4 className="font-bold text-gray-950 text-base">{match.fullName}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{match.subCaste} • {match.location}</p>
                          <p className="text-xs text-gray-600 mt-2 line-clamp-1">{match.occupation || 'Member'}</p>
                          
                          <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2 w-full">
                            <button
                              disabled={isInterestSent || isConnecting}
                              onClick={() => handleConnect(match)}
                              className={`flex-grow py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1 transition ${
                                isInterestSent 
                                  ? 'bg-green-50 text-green-600 border border-green-150' 
                                  : 'bg-matrimony-50 text-matrimony-600 hover:bg-matrimony-100 border border-transparent'
                              }`}
                            >
                              {isConnecting ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : isInterestSent ? (
                                <>Interest Sent</>
                              ) : (
                                <><Heart className="w-3.5 h-3.5 fill-current" /> Connect</>
                              )}
                            </button>
                            <button
                              onClick={() => handleShortlist(match)}
                              disabled={isShortlisted}
                              className={`p-2 border rounded-xl transition flex items-center justify-center ${
                                isShortlisted
                                  ? 'bg-yellow-50 border-yellow-200 text-yellow-500'
                                  : 'border-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50/50'
                              }`}
                            >
                              <Star className={`w-4 h-4 ${isShortlisted ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => handleStartChat(match)}
                              className="p-2 border border-gray-200 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl transition flex items-center justify-center"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
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
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
