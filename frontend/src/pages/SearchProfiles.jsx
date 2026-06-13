import React, { useState, useEffect } from 'react';
import { Filter, Search, Heart, MapPin, Briefcase, Star, Loader } from 'lucide-react';
import api from '../api';

const SearchProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/profiles');
        setProfiles(response.data || []);
      } catch (err) {
        setError('Failed to load matches. Please make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const getProfileImage = (profile) => {
    if (profile.photoUrl) return profile.photoUrl;
    if (profile.gender === 'FEMALE') {
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80';
  };

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
            <div key={profile.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img 
                  src={getProfileImage(profile)} 
                  alt={profile.fullName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-matrimony-600 font-bold px-3 py-1 rounded-full text-sm shadow-sm border border-white/50">
                  {profile.matchScore}% Match
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold">{profile.fullName || 'Member'}</h3>
                  <p className="text-sm opacity-90">{profile.gender} • {profile.height ? `${profile.height} ft` : ''}</p>
                </div>
              </div>
              
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
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-matrimony-50 text-matrimony-600 font-semibold rounded-xl hover:bg-matrimony-100 transition flex items-center justify-center">
                    <Heart className="w-4 h-4 mr-2" /> Connect
                  </button>
                  <button className="p-2.5 border border-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-xl transition flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchProfiles;
