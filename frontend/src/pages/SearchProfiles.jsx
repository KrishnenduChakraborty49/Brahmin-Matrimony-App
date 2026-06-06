import React, { useState } from 'react';
import { Filter, Search, Heart, MapPin, Briefcase, Star } from 'lucide-react';

const mockProfiles = [
  { id: 1, name: 'Priya Sharma', age: 26, height: '5\'4"', profession: 'Software Engineer', location: 'Bangalore', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
  { id: 2, name: 'Anjali Desai', age: 24, height: '5\'2"', profession: 'Doctor', location: 'Mumbai', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
  { id: 3, name: 'Kavita Iyer', age: 28, height: '5\'6"', profession: 'Architect', location: 'Chennai', img: 'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=400&q=80' },
  { id: 4, name: 'Neha Mishra', age: 27, height: '5\'3"', profession: 'CA', location: 'Delhi', img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' }
];

const SearchProfiles = () => {
  const [searchTerm, setSearchTerm] = useState('');

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
              placeholder="Search by name or location..." 
              className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-matrimony-500 focus:border-transparent outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
          </div>
          <button className="p-3 bg-white border border-gray-300 rounded-full hover:bg-gray-50 flex items-center justify-center shadow-sm">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grid of Profiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mockProfiles.map(profile => (
          <div key={profile.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            <div className="relative h-64 overflow-hidden bg-gray-200">
              <img src={profile.img} alt={profile.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="text-xl font-bold">{profile.name}, {profile.age}</h3>
                <p className="text-sm opacity-90">{profile.height}</p>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2 text-matrimony-500" /> {profile.profession}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 text-matrimony-500" /> {profile.location}
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
    </div>
  );
};

export default SearchProfiles;
