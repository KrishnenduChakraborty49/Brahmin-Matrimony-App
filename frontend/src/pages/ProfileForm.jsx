import React from 'react';
import { Save } from 'lucide-react';

const ProfileForm = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500">Provide accurate details to find the best match.</p>
          </div>
          <button className="flex items-center px-4 py-2 bg-matrimony-600 text-white rounded-lg hover:bg-matrimony-700 font-medium transition shadow-sm">
            <Save className="w-4 h-4 mr-2" /> Save Details
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Basic Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="e.g. Rahul Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500">
                  <option>Select</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500">
                  <option>Never Married</option>
                  <option>Divorced</option>
                  <option>Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Religious Background */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Religious Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Caste</label>
                <input type="text" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="e.g. Iyer, Kanyakubja, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
                <input type="text" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="e.g. Hindi, Tamil, Bengali" />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Professional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input type="text" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="e.g. B.Tech, MBA" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input type="text" className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                <select className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500">
                  <option>Select Range</option>
                  <option>0 - 5 Lakhs</option>
                  <option>5 - 10 Lakhs</option>
                  <option>10 - 20 Lakhs</option>
                  <option>20+ Lakhs</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* About Me */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">About Me</h3>
            <div>
              <textarea rows={4} className="w-full rounded-xl border-gray-300 bg-gray-50 border py-3 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" placeholder="Write a few lines about yourself, your hobbies, and what you are looking for in a partner..."></textarea>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
