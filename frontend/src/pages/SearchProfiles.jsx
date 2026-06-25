import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, Heart, MapPin, Briefcase, Star, Loader, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import api from '../api';
import AstrologyModal from '../components/AstrologyModal';

const ProfileCard = ({ profile, isShortlisted, onToggleShortlist, onCheckAstro }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const navigate = useNavigate();

  const photoUrls = profile.photoUrls && profile.photoUrls.length > 0
    ? profile.photoUrls
    : [
        profile.photoUrl ||
        (profile.gender === 'FEMALE'
          ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80')
      ];

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePhotoIndex((prev) => (prev + 1) % photoUrls.length);
  };

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePhotoIndex((prev) => (prev - 1 + photoUrls.length) % photoUrls.length);
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
      {/* Image Container with Hover Scaling */}
      <div className="relative h-64 overflow-hidden bg-gray-200">
        <img 
          src={photoUrls[activePhotoIndex]} 
          alt={profile.fullName} 
          className="w-full h-full object-cover transition-transform duration-500" 
        />

        {/* Carousel controls if more than 1 photo */}
        {photoUrls.length > 1 && (
          <>
            <button 
              onClick={handlePrevPhoto}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextPhoto}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm z-20 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* 1/2, 2/2 Indicator */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2.5 py-0.5 rounded-full z-20 font-bold backdrop-blur-sm tracking-wide">
              {activePhotoIndex + 1}/{photoUrls.length}
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-matrimony-600 font-bold px-3 py-1 rounded-full text-sm shadow-sm border border-white/50 z-10">
          {profile.matchScore}% Match
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white z-10">
          <h3 className="text-xl font-bold">{profile.fullName || 'Member'}</h3>
          <p className="text-sm opacity-90">{profile.gender} • {profile.height ? `${profile.height} ft` : ''}</p>
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-5">
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600">
            <Briefcase className="w-4 h-4 mr-2 text-matrimony-500" /> {profile.occupation || 'Not specified'}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-matrimony-500" /> {profile.location || 'Not specified'}
          </div>
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-full inline-block">
            {profile.subCaste || 'Brahmin'}
          </div>
        </div>
        
        <button 
          onClick={onCheckAstro}
          className="w-full mb-3 py-2 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border border-rose-100/50 text-rose-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          Check Kundali Match
        </button>

        <div className="flex gap-2">
          <button 
            onClick={async () => {
              try {
                const res = await api.post(`/chat/init/${profile.userId}`);
                navigate(`/chat?chatId=${res.data.id}`);
              } catch (err) {
                console.error("Failed to initiate chat", err);
              }
            }}
            className="flex-1 py-2.5 bg-matrimony-50 text-matrimony-600 font-semibold rounded-xl hover:bg-matrimony-100 transition flex items-center justify-center"
          >
            <Heart className="w-4 h-4 mr-2" /> Connect
          </button>
          <button 
            onClick={onToggleShortlist}
            className={`p-2.5 border rounded-xl transition flex items-center justify-center ${
              isShortlisted 
                ? 'bg-yellow-50 border-yellow-200 text-yellow-500' 
                : 'border-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50/50'
            }`}
          >
            <Star className={`w-5 h-5 ${isShortlisted ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SearchProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [shortlistedIds, setShortlistedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [selectedAstroProfile, setSelectedAstroProfile] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get('/profiles/me');
        setCurrentUserProfile(res.data);
      } catch (err) {
        console.error('Error fetching current user profile:', err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('query');
    if (q) {
      setSearchTerm(q);
    }

    const fetchMatchesAndShortlist = async () => {
      try {
        const response = await api.get('/profiles');
        setProfiles(response.data || []);
        
        const shortlistRes = await api.get('/matchmaking/shortlist');
        const ids = new Set((shortlistRes.data || []).map(item => item.profileId));
        setShortlistedIds(ids);
      } catch (err) {
        setError('Failed to load matches. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatchesAndShortlist();
  }, []);

  const filteredProfiles = profiles.filter(profile => {
    const term = searchTerm.toLowerCase();
    const nameMatch = profile.fullName?.toLowerCase().includes(term);
    const locationMatch = profile.location?.toLowerCase().includes(term);
    const subCasteMatch = profile.subCaste?.toLowerCase().includes(term);
    return nameMatch || locationMatch || subCasteMatch;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
        <p className="text-gray-500">Finding matches in the community...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Find Matches</h1>
          <p className="text-gray-500 mt-1">Discover compatible profiles from our community</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-80">
            <input 
              type="text" 
              placeholder="Search by name, location or sub-caste..." 
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-matrimony-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      {filteredProfiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 p-8">
          <p className="text-gray-500 text-lg">No matches found in the database.</p>
          <p className="text-gray-400 text-sm mt-2">Try registering more profiles or check back later!</p>
        </div>
      ) : (
        /* Grid of Profiles */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProfiles.map(profile => (
            <ProfileCard 
              key={profile.id} 
              profile={profile} 
              isShortlisted={shortlistedIds.has(profile.id)}
              onCheckAstro={() => setSelectedAstroProfile(profile)}
              onToggleShortlist={async () => {
                const alreadyShortlisted = shortlistedIds.has(profile.id);
                try {
                  if (alreadyShortlisted) {
                    await api.delete(`/matchmaking/shortlist/${profile.id}`);
                    setShortlistedIds(prev => {
                      const next = new Set(prev);
                      next.delete(profile.id);
                      return next;
                    });
                  } else {
                    await api.post(`/matchmaking/shortlist/${profile.id}`);
                    setShortlistedIds(prev => {
                      const next = new Set(prev);
                      next.add(profile.id);
                      return next;
                    });
                  }
                } catch (err) {
                  console.error('Failed to toggle shortlist:', err);
                }
              }}
            />
          ))}
        </div>
      )}

      <AstrologyModal 
        isOpen={!!selectedAstroProfile}
        onClose={() => setSelectedAstroProfile(null)}
        targetProfile={selectedAstroProfile}
        currentUserProfile={currentUserProfile}
      />
    </div>
  );
};

export default SearchProfiles;
