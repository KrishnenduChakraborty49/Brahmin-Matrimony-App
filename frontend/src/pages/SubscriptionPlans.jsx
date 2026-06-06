import React from 'react';
import { Check, Shield, Crown, Zap } from 'lucide-react';

const SubscriptionPlans = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Upgrade Your Matchmaking Experience</h1>
        <p className="text-xl text-gray-600 mb-16 max-w-2xl mx-auto">Choose a premium plan to unlock unlimited chats, view contact numbers, and stand out.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Free Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Shield className="w-6 h-6 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
            <div className="text-4xl font-extrabold text-gray-900 mb-6">₹0</div>
            <ul className="space-y-4 mb-8 flex-grow text-left text-gray-600">
              <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" /> Create Profile</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-3" /> Basic Search</li>
              <li className="flex items-center text-gray-400"><Check className="w-5 h-5 mr-3" /> Send Interests (Limit: 5/day)</li>
              <li className="flex items-center text-gray-400 opacity-50"><Check className="w-5 h-5 mr-3" /> View Contact Numbers</li>
              <li className="flex items-center text-gray-400 opacity-50"><Check className="w-5 h-5 mr-3" /> Unlimited Chats</li>
            </ul>
            <button className="w-full py-3 px-4 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition">
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-b from-matrimony-600 to-matrimony-800 rounded-3xl p-8 border-2 border-matrimony-500 shadow-2xl flex flex-col transform md:-translate-y-4 relative">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border-2 border-white shadow-sm">
              Most Popular
            </div>
            <div className="w-12 h-12 bg-matrimony-500 rounded-full flex items-center justify-center mb-6 mx-auto border border-matrimony-400 shadow-inner">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <div className="text-4xl font-extrabold text-white mb-6">₹1,999 <span className="text-lg font-normal text-matrimony-200">/ 3 mo</span></div>
            <ul className="space-y-4 mb-8 flex-grow text-left text-matrimony-100">
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-matrimony-300 mr-3" /> Everything in Free</li>
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-matrimony-300 mr-3" /> Unlimited Interests</li>
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-matrimony-300 mr-3" /> View 50 Contact Numbers</li>
              <li className="flex items-center text-white"><Check className="w-5 h-5 text-matrimony-300 mr-3" /> Unlimited Chats</li>
              <li className="flex items-center text-matrimony-300 opacity-50"><Check className="w-5 h-5 mr-3" /> Profile Highlight</li>
            </ul>
            <button className="w-full py-4 px-4 rounded-xl font-bold bg-white text-matrimony-600 shadow-lg hover:shadow-xl hover:scale-105 transition duration-300">
              Pay with Razorpay
            </button>
          </div>

          {/* Gold Plan */}
          <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col hover:shadow-xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Gold</h3>
            <div className="text-4xl font-extrabold text-gray-900 mb-6">₹3,999 <span className="text-lg font-normal text-gray-500">/ 6 mo</span></div>
            <ul className="space-y-4 mb-8 flex-grow text-left text-gray-600">
              <li className="flex items-center"><Check className="w-5 h-5 text-yellow-500 mr-3" /> Everything in Premium</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-yellow-500 mr-3" /> View 150 Contact Numbers</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-yellow-500 mr-3" /> Priority Customer Support</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-yellow-500 mr-3" /> Dedicated Relationship Manager</li>
              <li className="flex items-center"><Check className="w-5 h-5 text-yellow-500 mr-3" /> Profile Highlight Flag</li>
            </ul>
            <button className="w-full py-3 px-4 rounded-xl font-bold border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50 transition">
              Pay with Razorpay
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
