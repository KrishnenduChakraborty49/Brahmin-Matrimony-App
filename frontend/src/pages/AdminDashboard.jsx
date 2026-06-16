import React, { useState, useEffect } from 'react';
import { Users, Activity, CreditCard, AlertCircle, Search, ShieldCheck, UserX, BarChart3, Check, X, ShieldAlert, Loader } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    activeMatches: 0,
    reportedProfiles: 0
  });
  const [users, setUsers] = useState([]);
  const [pendingPhotos, setPendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data);

      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data);

      const photosRes = await api.get('/admin/photos/pending');
      setPendingPhotos(photosRes.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleVerify = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/verify`);
      setMessage("Verification status updated successfully!");
      fetchDashboardData();
    } catch (err) {
      setMessage("Failed to update verification status.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/suspend`);
      setMessage("User suspension status updated successfully!");
      fetchDashboardData();
    } catch (err) {
      setMessage("Failed to update suspension status.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSubscriptionChange = async (userId, plan) => {
    setActionLoading(userId);
    try {
      await api.put(`/admin/users/${userId}/subscription`, null, {
        params: { plan }
      });
      setMessage(`Subscription updated to ${plan} successfully!`);
      fetchDashboardData();
    } catch (err) {
      setMessage("Failed to update subscription.");
    } finally {
      setActionLoading(null);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleApprovePhoto = async (photoId) => {
    try {
      await api.put(`/admin/photos/${photoId}/approve`);
      setMessage("Photo approved successfully!");
      fetchDashboardData();
    } catch (err) {
      setMessage("Failed to approve photo.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleRejectPhoto = async (photoId) => {
    try {
      await api.delete(`/admin/photos/${photoId}`);
      setMessage("Photo rejected and deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      setMessage("Failed to reject photo.");
    } finally {
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toString().includes(searchTerm)
  );

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { title: 'Premium Members', value: stats.premiumUsers, icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { title: 'Active Matches', value: stats.activeMatches, icon: Activity, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
    { title: 'Pending Photo Approvals', value: stats.reportedProfiles, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  ];

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader className="w-10 h-10 text-matrimony-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-gray-50">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 border-b border-slate-850">
          <h2 className="text-2xl font-bold tracking-tight text-matrimony-500">Admin<span className="text-white">Panel</span></h2>
          <p className="text-xs text-slate-500 mt-1">BrahminMilan Moderation</p>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'overview' ? 'bg-matrimony-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5 mr-3 shrink-0" /> Dashboard Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'users' ? 'bg-matrimony-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3 shrink-0" /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'subscriptions' ? 'bg-matrimony-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <CreditCard className="w-5 h-5 mr-3 shrink-0" /> Manage Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab('moderation')}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition font-semibold text-sm ${activeTab === 'moderation' ? 'bg-matrimony-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'}`}
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" /> Photo Moderation
            {pendingPhotos.length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">{pendingPhotos.length}</span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {message && (
          <div className="mb-6 bg-slate-900 border-l-4 border-matrimony-500 text-white p-4 rounded-xl text-sm font-medium shadow-md flex justify-between items-center transition-all animate-in fade-in slide-in-from-top-4">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 capitalize">{activeTab === 'reports' ? 'Moderation' : activeTab}</h1>
            <p className="text-slate-500 mt-1">
              {activeTab === 'overview' && 'Real-time overview of metrics and users'}
              {activeTab === 'users' && 'Manage registration verifications and accounts'}
              {activeTab === 'subscriptions' && 'Upgrade or downgrade user subscription plans'}
              {activeTab === 'moderation' && 'Review and approve/reject profile photos'}
            </p>
          </div>
          {activeTab !== 'overview' && activeTab !== 'moderation' && (
            <div className="relative w-full md:w-80">
              <input 
                type="text" 
                placeholder="Search users by name, email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-full focus:ring-2 focus:ring-matrimony-500 focus:border-transparent outline-none bg-white shadow-sm"
              />
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
            </div>
          )}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} mr-4`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                    <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent users list */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <h2 className="text-xl font-bold text-slate-900">Recent Registrations</h2>
                <button onClick={() => setActiveTab('users')} className="text-sm font-bold text-matrimony-600 hover:text-matrimony-700">View All Users</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4 pl-6">User</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Verification</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {users.slice(0, 5).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 pl-6">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-matrimony-50 text-matrimony-600 flex items-center justify-center font-bold mr-3 border border-matrimony-100">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-xs text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-700' : 
                            u.plan === 'GOLD' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            u.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {u.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`flex items-center font-semibold text-xs ${
                            u.isSuspended ? 'text-red-600' : 'text-green-600'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${
                              u.isSuspended ? 'bg-red-500' : 'bg-green-500'
                            }`}></span>
                            {u.isSuspended ? 'Suspended' : 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">User</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-matrimony-50 text-matrimony-600 flex items-center justify-center font-bold mr-3 border border-matrimony-100">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-700' : 
                          u.plan === 'GOLD' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center font-semibold text-xs ${
                          u.isSuspended ? 'text-red-600' : 'text-green-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${
                            u.isSuspended ? 'bg-red-500' : 'bg-green-500'
                          }`}></span>
                          {u.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerify(u.id)}
                            disabled={actionLoading === u.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.isVerified ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                            }`}
                          >
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            onClick={() => handleSuspend(u.id)}
                            disabled={actionLoading === u.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                              u.isSuspended ? 'bg-green-50 hover:bg-green-100 text-green-600 border border-green-200' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                            }`}
                          >
                            {u.isSuspended ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400 font-medium">No users found matching your search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 pl-6">User</th>
                    <th className="p-4">Current Subscription Plan</th>
                    <th className="p-4 text-center">Change Plan Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 pl-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-xl bg-matrimony-50 text-matrimony-600 flex items-center justify-center font-bold mr-3 border border-matrimony-100">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{u.name}</div>
                            <div className="text-xs text-slate-400">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.plan === 'PREMIUM' ? 'bg-purple-100 text-purple-700' : 
                          u.plan === 'GOLD' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleSubscriptionChange(u.id, 'FREE')}
                            disabled={actionLoading === u.id || u.plan === 'FREE'}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs disabled:opacity-40"
                          >
                            Downgrade Free
                          </button>
                          <button
                            onClick={() => handleSubscriptionChange(u.id, 'PREMIUM')}
                            disabled={actionLoading === u.id || u.plan === 'PREMIUM'}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-40"
                          >
                            Upgrade Premium
                          </button>
                          <button
                            onClick={() => handleSubscriptionChange(u.id, 'GOLD')}
                            disabled={actionLoading === u.id || u.plan === 'GOLD'}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm disabled:opacity-40"
                          >
                            Upgrade Gold
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-8 text-center text-slate-400 font-medium">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Photo Approvals</h2>
            {pendingPhotos.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-6">
                No pending profile photos to review at this moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingPhotos.map((photo) => (
                  <div key={photo.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="relative h-64 bg-slate-100">
                      <img 
                        src={photo.url} 
                        alt="Pending approval" 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {photo.type}
                      </span>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-slate-900">{photo.userName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{photo.userEmail}</p>
                      
                      <div className="flex gap-2.5 mt-5">
                        <button
                          onClick={() => handleApprovePhoto(photo.id)}
                          className="flex-1 flex justify-center items-center py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm shadow-sm transition"
                        >
                          <Check className="w-4 h-4 mr-1.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectPhoto(photo.id)}
                          className="flex-1 flex justify-center items-center py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-sm border border-red-200 transition"
                        >
                          <X className="w-4 h-4 mr-1.5" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminDashboard;
