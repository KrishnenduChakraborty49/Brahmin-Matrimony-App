import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, Star, MessageSquare, MapPin, Briefcase, User, Sparkles, Loader, Check, X, ShieldAlert } from 'lucide-react';
import api from '../api';

const InterestsShortlist = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Set active tab based on path or query param
  const initialTab = searchParams.get('tab') || 'received';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [receivedInterests, setReceivedInterests] = useState([]);
  const [sentInterests, setSentInterests] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Sync tab query param with state
  useEffect(() => {
    setSearchParams({ tab: activeTab });
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'received') {
        const res = await api.get('/matchmaking/interests/received');
        setReceivedInterests(res.data || []);
      } else if (activeTab === 'sent') {
        const res = await api.get('/matchmaking/interests/sent');
        setSentInterests(res.data || []);
      } else if (activeTab === 'shortlist') {
        const res = await api.get('/matchmaking/shortlist');
        setShortlisted(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load data for tab:', activeTab, err);
      setError('Could not fetch list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondInterest = async (interestId, status) => {
    setActionLoadingId(interestId);
    setError('');
    setSuccessMessage('');
    try {
      await api.post(`/matchmaking/interests/${interestId}/respond?status=${status}`);
      setSuccessMessage(`Interest ${status.toLowerCase()} successfully!`);
      // Reload received interests
      fetchData();
    } catch (err) {
      console.error('Failed to respond to interest:', err);
      setError('Could not update interest status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConnectFromShortlist = async (match) => {
    setActionLoadingId(match.profileId);
    setError('');
    setSuccessMessage('');
    try {
      await api.post(`/matchmaking/interests/send/${match.userId}`);
      setSuccessMessage('Interest sent successfully!');
      // Update shortlist item status locally or reload
      fetchData();
    } catch (err) {
      console.error('Failed to send interest:', err);
      setError(err.response?.data?.message || 'Could not send interest.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemoveShortlist = async (profileId) => {
    setActionLoadingId(profileId);
    setError('');
    setSuccessMessage('');
    try {
      await api.delete(`/matchmaking/shortlist/${profileId}`);
      setSuccessMessage('Profile removed from shortlist.');
      setShortlisted(prev => prev.filter(item => item.profileId !== profileId));
    } catch (err) {
      console.error('Failed to remove from shortlist:', err);
      setError('Could not remove profile from shortlist.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const res = await api.post(`/chat/init/${userId}`);
      navigate(`/chat?chatId=${res.data.id}`);
    } catch (err) {
      console.error('Failed to start chat:', err);
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase">Accepted</span>;
      case 'DECLINED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full uppercase">Declined</span>;
      default:
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase">Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[75vh]">
      
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Interests & Shortlists</h1>
        <p className="text-gray-500 mt-1">Manage your connection requests and shortlisted profiles</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('received')}
          className={`py-3 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === 'received'
              ? 'border-matrimony-600 text-matrimony-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Interests Received
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`py-3 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === 'sent'
              ? 'border-matrimony-600 text-matrimony-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Interests Sent
        </button>
        <button
          onClick={() => setActiveTab('shortlist')}
          className={`py-3 px-6 font-bold text-sm border-b-2 whitespace-nowrap transition-all duration-200 ${
            activeTab === 'shortlist'
              ? 'border-matrimony-600 text-matrimony-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Shortlisted Profiles
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 bg-slate-900 border-l-4 border-green-500 text-white p-4 rounded-xl text-sm font-medium shadow-md flex justify-between items-center animate-in fade-in duration-200">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      )}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium flex justify-between items-center animate-in fade-in duration-200">
          <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> {error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* List Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24">
          <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Fetching details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* RECEIVED INTERESTS TAB */}
          {activeTab === 'received' && (
            receivedInterests.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-150 p-8 flex flex-col items-center justify-center gap-3">
                <Heart className="w-12 h-12 text-gray-300 fill-current" />
                <h3 className="text-lg font-bold text-gray-800">No Interests Received</h3>
                <p className="text-gray-400 text-sm max-w-sm">When other members express interest in connecting with you, they will appear here.</p>
              </div>
            ) : (
              receivedInterests.map((item) => (
                <div key={item.interestId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
                  <div className="relative h-56 bg-gray-200">
                    <img 
                      src={item.avatar || (item.gender === 'FEMALE' 
                        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' 
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80')} 
                      alt={item.fullName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-matrimony-600 text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                      {item.matchScore}% Match
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{item.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{item.subCaste || 'Brahmin'} • {item.location}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> {item.occupation || 'Not specified'}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> Lives in {item.location || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-400">
                        {renderStatusBadge(item.status)}
                      </div>
                      
                      {item.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoadingId === item.interestId}
                            onClick={() => handleRespondInterest(item.interestId, 'DECLINED')}
                            className="p-2 border border-gray-200 text-red-500 hover:bg-red-50 rounded-xl transition flex items-center justify-center"
                            title="Decline"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            disabled={actionLoadingId === item.interestId}
                            onClick={() => handleRespondInterest(item.interestId, 'ACCEPTED')}
                            className="py-2 px-4 bg-matrimony-600 text-white hover:bg-matrimony-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </button>
                        </div>
                      )}

                      {item.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStartChat(item.userId)}
                          className="py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* SENT INTERESTS TAB */}
          {activeTab === 'sent' && (
            sentInterests.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-150 p-8 flex flex-col items-center justify-center gap-3">
                <Heart className="w-12 h-12 text-gray-300 fill-current" />
                <h3 className="text-lg font-bold text-gray-800">No Interests Sent</h3>
                <p className="text-gray-400 text-sm max-w-sm">When you find compatible matches and connect with them, your request history will list here.</p>
                <button onClick={() => navigate('/search')} className="mt-3 px-5 py-2 bg-matrimony-600 text-white rounded-full text-xs font-bold hover:bg-matrimony-750 transition">Find Matches</button>
              </div>
            ) : (
              sentInterests.map((item) => (
                <div key={item.interestId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
                  <div className="relative h-56 bg-gray-200">
                    <img 
                      src={item.avatar || (item.gender === 'FEMALE' 
                        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' 
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80')} 
                      alt={item.fullName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-matrimony-600 text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                      {item.matchScore}% Match
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{item.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{item.subCaste || 'Brahmin'} • {item.location}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> {item.occupation || 'Not specified'}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> Lives in {item.location || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                      <div className="text-xs font-semibold text-gray-400">
                        Status: {renderStatusBadge(item.status)}
                      </div>
                      
                      {item.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleStartChat(item.userId)}
                          className="py-2 px-4 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )
          )}

          {/* SHORTLISTED TAB */}
          {activeTab === 'shortlist' && (
            shortlisted.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-gray-150 p-8 flex flex-col items-center justify-center gap-3">
                <Star className="w-12 h-12 text-gray-300 fill-current" />
                <h3 className="text-lg font-bold text-gray-800">No Shortlisted Profiles</h3>
                <p className="text-gray-400 text-sm max-w-sm">Bookmark profiles you're interested in by clicking the Star icon on their cards to list them here.</p>
                <button onClick={() => navigate('/search')} className="mt-3 px-5 py-2 bg-matrimony-600 text-white rounded-full text-xs font-bold hover:bg-matrimony-750 transition">Find Matches</button>
              </div>
            ) : (
              shortlisted.map((item) => (
                <div key={item.shortlistId} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col">
                  <div className="relative h-56 bg-gray-200">
                    <img 
                      src={item.avatar || (item.gender === 'FEMALE' 
                        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' 
                        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80')} 
                      alt={item.fullName} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-matrimony-600 text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                      {item.matchScore}% Match
                    </div>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{item.fullName}</h3>
                      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">{item.subCaste || 'Brahmin'} • {item.location}</p>
                      
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-xs text-gray-600">
                          <Briefcase className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> {item.occupation || 'Not specified'}
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="w-3.5 h-3.5 mr-2 text-matrimony-500" /> Lives in {item.location || 'Not specified'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2 w-full">
                      <button
                        disabled={actionLoadingId === item.profileId}
                        onClick={() => handleConnectFromShortlist(item)}
                        className="flex-grow py-2 px-3 bg-matrimony-50 text-matrimony-600 hover:bg-matrimony-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                      >
                        {actionLoadingId === item.profileId ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <><Heart className="w-3.5 h-3.5 fill-current" /> Connect</>
                        )}
                      </button>
                      <button
                        disabled={actionLoadingId === item.profileId}
                        onClick={() => handleRemoveShortlist(item.profileId)}
                        className="p-2 border border-gray-200 text-red-500 hover:bg-red-50 rounded-xl transition flex items-center justify-center"
                        title="Remove from Shortlist"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStartChat(item.userId)}
                        className="p-2 border border-gray-200 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-xl transition flex items-center justify-center"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )
          )}

        </div>
      )}

    </div>
  );
};

export default InterestsShortlist;
