import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader } from 'lucide-react';
import api from '../api';

const ProfileForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    gender: 'MALE',
    dob: '',
    maritalStatus: 'NEVER_MARRIED',
    subCaste: '',
    motherTongue: '',
    height: 5.5,
    location: '',
    education: '',
    occupation: '',
    companyName: '',
    salary: '',
    foodPreference: 'Vegetarian',
    aboutMe: '',
    partnerPreferences: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profiles/me');
        if (response.data) {
          const p = response.data;
          setFormData({
            fullName: p.fullName || '',
            gender: p.gender || 'MALE',
            dob: p.dob || '',
            maritalStatus: p.maritalStatus || 'NEVER_MARRIED',
            subCaste: p.subCaste || '',
            motherTongue: p.motherTongue || '',
            height: p.height || 5.5,
            location: p.location || '',
            education: p.education || '',
            occupation: p.occupation || '',
            companyName: p.companyName || '',
            salary: p.salary || '',
            foodPreference: p.foodPreference || 'Vegetarian',
            aboutMe: p.aboutMe || '',
            partnerPreferences: p.partnerPreferences || ''
          });
        }
      } catch (err) {
        console.log('Profile fetch error (might not exist yet):', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/profiles/me', {
        ...formData,
        height: parseFloat(formData.height) || 0.0
      });
      setSuccess('Profile details saved successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
        <p className="text-gray-500">Loading your profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500">Provide accurate details to find the best match.</p>
          </div>
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center px-5 py-2.5 bg-matrimony-600 text-white rounded-xl hover:bg-matrimony-700 font-bold transition shadow-sm disabled:opacity-50"
          >
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" /> Save Details
              </>
            )}
          </button>
        </div>

        <div className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-xl text-sm font-medium">
              {success}
            </div>
          )}

          {/* Basic Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Basic Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Rahul Sharma" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob"
                  required
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select 
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500"
                >
                  <option value="NEVER_MARRIED">Never Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                  <option value="AWAITING_DIVORCE">Awaiting Divorce</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (e.g. 5.5)</label>
                <input 
                  type="number" 
                  step="0.01"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. 5.5" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (City, State)</label>
                <input 
                  type="text" 
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Bangalore, Karnataka" 
                />
              </div>
            </div>
          </div>

          {/* Religious Background */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Religious Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Caste</label>
                <input 
                  type="text" 
                  name="subCaste"
                  value={formData.subCaste}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Iyer, Kanyakubja, etc." 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother Tongue</label>
                <input 
                  type="text" 
                  name="motherTongue"
                  value={formData.motherTongue}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Hindi, Tamil, Bengali" 
                />
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Professional & Lifestyle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input 
                  type="text" 
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. B.Tech, MBA" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <input 
                  type="text" 
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Software Engineer" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                  placeholder="e.g. Google" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income</label>
                <select 
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500"
                >
                  <option value="">Select Range</option>
                  <option value="0 - 5 Lakhs">0 - 5 Lakhs</option>
                  <option value="5 - 10 Lakhs">5 - 10 Lakhs</option>
                  <option value="10 - 20 Lakhs">10 - 20 Lakhs</option>
                  <option value="20+ Lakhs">20+ Lakhs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Preference</label>
                <select 
                  name="foodPreference"
                  value={formData.foodPreference}
                  onChange={handleChange}
                  className="w-full rounded-xl border-gray-300 bg-gray-50 border py-2.5 px-4 focus:ring-matrimony-500 focus:border-matrimony-500"
                >
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Non-Vegetarian">Non-Vegetarian</option>
                  <option value="Eggetarian">Eggetarian</option>
                  <option value="Vegan">Vegan</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* About Me & Partner Preferences */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">About Me</h3>
              <textarea 
                rows={4} 
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-300 bg-gray-50 border py-3 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                placeholder="Write a few lines about yourself, your hobbies, and what you are looking for in a partner..."
              ></textarea>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Partner Preferences</h3>
              <textarea 
                rows={4} 
                name="partnerPreferences"
                value={formData.partnerPreferences}
                onChange={handleChange}
                className="w-full rounded-xl border-gray-300 bg-gray-50 border py-3 px-4 focus:ring-matrimony-500 focus:border-matrimony-500" 
                placeholder="Describe your ideal partner (e.g. Education, Location, sub-caste, expectations)..."
              ></textarea>
            </div>
          </div>

          {/* Bottom Submit Button */}
          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center px-8 py-3 bg-matrimony-600 text-white font-bold rounded-xl hover:bg-matrimony-700 transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>Saving Details...</>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Save Profile Details
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;
