import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, ShieldCheck, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-matrimony-500 via-matrimony-600 to-matrimony-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-semibold tracking-wide uppercase">The Most Trusted Brahmin Matrimony</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-md">
            Find Your Perfect Match <br />
            <span className="text-matrimony-100">Within the Community</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl md:text-2xl text-matrimony-50 mb-10">
            Join thousands of Brahmin families who have found their perfect soulmates through our verified and secure platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="px-8 py-4 bg-white text-matrimony-600 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Register Free
            </Link>
            <Link to="/login" className="px-8 py-4 bg-matrimony-700/50 border border-matrimony-100/30 text-white rounded-full font-bold text-lg hover:bg-matrimony-800/60 transition-all duration-300 backdrop-blur-sm">
              Login to Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose BrahminMilan?</h2>
            <p className="mt-4 text-lg text-gray-600">We blend tradition with modern technology to find your ideal life partner.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-matrimony-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-matrimony-100">
              <div className="w-16 h-16 mx-auto bg-matrimony-500 rounded-full flex items-center justify-center mb-6 shadow-md">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Verified Profiles</h3>
              <p className="text-gray-600">Every profile goes through a strict verification process to ensure authenticity and safety.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-matrimony-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-matrimony-100 transform md:-translate-y-4">
              <div className="w-16 h-16 mx-auto bg-matrimony-600 rounded-full flex items-center justify-center mb-6 shadow-md">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI Compatibility</h3>
              <p className="text-gray-600">Our advanced matchmaking algorithm suggests highly compatible matches based on your preferences.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-matrimony-50 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow duration-300 border border-matrimony-100">
              <div className="w-16 h-16 mx-auto bg-matrimony-700 rounded-full flex items-center justify-center mb-6 shadow-md">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">100% Privacy</h3>
              <p className="text-gray-600">Control who sees your photos and contact details with our robust privacy settings.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
