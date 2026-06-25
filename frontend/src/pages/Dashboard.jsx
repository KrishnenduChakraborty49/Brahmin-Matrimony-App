import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { User, Users, Heart, Star, MessageCircle, Bell, Sparkles, Camera, Loader, CheckCircle, Clock, X, Check, Search, Crown, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import AstrologyModal from '../components/AstrologyModal';

const Dashboard = () => {
  const user = useSelector(state => state.auth.user);
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [selectedAstroProfile, setSelectedAstroProfile] = useState(null);

  // Dashboard Stats State
  const [stats, setStats] = useState({ 
    interests: 0, 
    shortlisted: 0, 
    messages: 0, 
    profileViews: 15,
    plan: 'FREE',
    endDate: null,
    subscriptionActive: false
  });
  
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

  // Time-based greeting helper
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Compatibility tags helper
  const getCompatibilityTags = (matchProfile) => {
    if (!profile) return [];
    const tags = [];
    
    // 1. Sub-caste
    if (profile.subCaste && matchProfile.subCaste && 
        profile.subCaste.toLowerCase() === matchProfile.subCaste.toLowerCase()) {
      tags.push('✓ Same Sub-caste');
    }
    
    // 2. Location
    if (profile.location && matchProfile.location) {
      const loc1 = profile.location.toLowerCase();
      const loc2 = matchProfile.location.toLowerCase();
      if (loc1 === loc2) {
        tags.push('✓ Location Match');
      } else if (loc1.includes('west bengal') && loc2.includes('west bengal')) {
        tags.push('✓ State Match (WB)');
      }
    }
    
    // 3. Education
    if (profile.education && matchProfile.education) {
      const edu1 = profile.education.toLowerCase();
      const edu2 = matchProfile.education.toLowerCase();
      if (edu1 === edu2) {
        tags.push('✓ Education Match');
      } else {
        const isBachelor = (edu) => edu.includes('b.sc') || edu.includes('b.a') || edu.includes('b.tech') || edu.includes('bachelor');
        if (isBachelor(edu1) && isBachelor(edu2)) {
          tags.push('✓ Degree Match');
        }
      }
    }
    
    // 4. Marital Status
    if (profile.maritalStatus && matchProfile.maritalStatus && 
        profile.maritalStatus === matchProfile.maritalStatus) {
      tags.push('✓ Marital Match');
    }
    
    return tags;
  };

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
          profileViews: statsRes.data.profileViews || 15,
          plan: statsRes.data.plan || 'FREE',
          endDate: statsRes.data.endDate || null,
          subscriptionActive: statsRes.data.subscriptionActive || false
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
          profileViews: statsRes.data.profileViews || 15,
          plan: statsRes.data.plan || 'FREE',
          endDate: statsRes.data.endDate || null,
          subscriptionActive: statsRes.data.subscriptionActive || false
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

  const checklistFields = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'gender', label: 'Gender' },
    { key: 'dob', label: 'Date of Birth' },
    { key: 'maritalStatus', label: 'Marital Status' },
    { key: 'subCaste', label: 'Sub-Caste' },
    { key: 'motherTongue', label: 'Mother Tongue' },
    { key: 'location', label: 'Location' },
    { key: 'education', label: 'Education' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'aboutMe', label: 'About Me' }
  ];

  const missingFields = checklistFields.filter(f => !profile || !profile[f.key]);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Top Banner */}
      <div className="bg-matrimony-700 pt-8 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-white">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {getTimeBasedGreeting()}, {profile?.fullName || user?.email?.split('@')[0] || 'Member'}!
              </h1>
              <p className="text-sm text-matrimony-100 mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-300 fill-current animate-pulse" />
                Welcome to your matchmaking hub.
                {stats.plan !== 'FREE' && (
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-bold text-yellow-950 bg-yellow-400 rounded-full border border-yellow-300 shadow-sm">
                    👑 {stats.plan} Member
                  </span>
                )}
              </p>
            </div>
            
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

            {/* Split layout: Matches (col-span-2) + Sidebar Widgets (col-span-1) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: Matches */}
              <div className="md:col-span-2 space-y-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {matches.map((match) => {
                        const isShortlisted = shortlistedIds.has(match.id);
                        const isInterestSent = sentInterestsIds.has(match.userId);
                        const isConnecting = connectingId === match.userId;

                        const matchPhoto = match.photoUrls && match.photoUrls.length > 0
                          ? match.photoUrls[0]
                          : match.photoUrl || (match.gender === 'FEMALE'
                            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80'
                            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80');

                        const tags = getCompatibilityTags(match);

                        return (
                          <div key={match.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between">
                            <div>
                              <div className="relative h-44 bg-gray-200">
                                <img src={matchPhoto} alt={match.fullName} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-matrimony-600 text-xs font-bold px-2 py-0.5 rounded-full border border-white/30">
                                  {match.matchScore}% Match
                                </div>
                              </div>
                              <div className="p-4">
                                <h4 className="font-bold text-gray-950 text-base">{match.fullName}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">{match.subCaste} • {match.location}</p>
                                <p className="text-xs text-gray-600 mt-1.5 line-clamp-1">{match.occupation || 'Member'}</p>
                                
                                {/* Compatibility Tags */}
                                {tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2.5">
                                    {tags.map((tag, idx) => (
                                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="p-4 pt-0">
                              <button 
                                onClick={() => setSelectedAstroProfile(match)}
                                className="w-full mb-3 py-1.5 bg-rose-50/50 hover:bg-rose-100/50 text-[10px] font-bold text-rose-700 border border-rose-100/40 rounded-xl transition flex items-center justify-center gap-1 active:scale-95 cursor-pointer font-semibold"
                              >
                                <Sparkles className="w-3 h-3 text-rose-500" />
                                Check Kundali Match
                              </button>

                              <div className="border-t border-gray-50 pt-4 flex gap-2 w-full">
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

              {/* Column 2: Sidebar Widgets */}
              <div className="md:col-span-1 space-y-6">
                
                {/* Interactive Quick Search Widget */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-matrimony-500" /> Quick Search
                  </h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if (quickSearchQuery.trim()) {
                      navigate(`/search?query=${encodeURIComponent(quickSearchQuery.trim())}`);
                    }
                  }} className="space-y-3">
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Enter sub-caste, location, name..." 
                        className="w-full pl-3 pr-8 py-2.5 text-xs rounded-xl border border-gray-200 focus:ring-2 focus:ring-matrimony-500 focus:border-transparent outline-none transition"
                        value={quickSearchQuery}
                        onChange={(e) => setQuickSearchQuery(e.target.value)}
                      />
                      {quickSearchQuery && (
                        <button 
                          type="button" 
                          onClick={() => setQuickSearchQuery('')} 
                          className="absolute right-2.5 top-3 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <button 
                      type="submit" 
                      disabled={!quickSearchQuery.trim()}
                      className="w-full py-2.5 bg-matrimony-600 hover:bg-matrimony-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition duration-300 animate-duration-300"
                    >
                      Search Matches
                    </button>
                  </form>
                </div>

                {/* Membership Level Card */}
                <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-md p-6 relative overflow-hidden">
                  <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-28 h-28 bg-yellow-500/10 rounded-full blur-xl pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-400/20">
                        Plan Details
                      </span>
                      <h3 className="text-lg font-bold mt-2">
                        {stats.plan === 'GOLD' ? 'Gold Premium' : stats.plan === 'PREMIUM' ? 'Premium Pro' : 'Free Basic Member'}
                      </h3>
                    </div>
                    {stats.plan !== 'FREE' ? (
                      <Crown className="w-8 h-8 text-yellow-400 animate-pulse animate-duration-1000" />
                    ) : (
                      <Shield className="w-8 h-8 text-slate-400" />
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-5">
                    {stats.plan !== 'FREE'
                      ? `Unlock unlimited connectivity, priority support, and match highlights until ${new Date(stats.endDate).toLocaleDateString()}.`
                      : 'Upgrade to a premium membership to unlock direct chat, phone view, and get 10x more profile visits.'}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duration</span>
                      <span className="text-xs font-bold text-slate-200">
                        {stats.plan !== 'FREE' ? 'Active Plan' : 'No Limit'}
                      </span>
                    </div>
                    <Link 
                      to="/upgrade" 
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-300 ${
                        stats.plan !== 'FREE' 
                          ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                          : 'bg-yellow-400 text-yellow-950 hover:bg-yellow-350 hover:scale-105 active:scale-95 shadow-lg shadow-yellow-400/20'
                      }`}
                    >
                      {stats.plan !== 'FREE' ? 'View Details' : 'Upgrade Plan'}
                    </Link>
                  </div>
                </div>

                {/* Profile Completeness Checklist Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900">Profile Checklist</h3>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-matrimony-50 text-matrimony-600">
                      {10 - missingFields.length}/10 Done
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">Complete these fields to improve your matchmaking score and visibility.</p>
                  
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {checklistFields.map((field) => {
                      const isCompleted = profile && !!profile[field.key];
                      return (
                        <div key={field.key} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50/50 transition">
                          <div className="flex items-center gap-2">
                            {isCompleted ? (
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 animate-in zoom-in" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                            )}
                            <span className={`text-xs ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
                              {field.label}
                            </span>
                          </div>
                          {!isCompleted && (
                            <Link 
                              to="/profile/edit" 
                              className="text-[10px] font-bold text-matrimony-600 hover:text-matrimony-700 hover:underline"
                            >
                              Add
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
      {/* Astrology Kundali Modal */}
      <AstrologyModal 
        isOpen={!!selectedAstroProfile}
        onClose={() => setSelectedAstroProfile(null)}
        targetProfile={selectedAstroProfile}
        currentUserProfile={profile}
      />
    </div>
  );
};

export default Dashboard;
