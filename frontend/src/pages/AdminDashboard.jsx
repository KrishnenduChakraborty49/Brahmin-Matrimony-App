import React, { useState } from 'react';
import { Users, Activity, CreditCard, AlertCircle, Search, MoreVertical, ShieldCheck, UserX, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const stats = [
    { title: 'Total Users', value: '12,453', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Premium Members', value: '3,842', change: '+24%', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Matches', value: '8,234', change: '+18%', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'Reported Profiles', value: '23', change: '-5%', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const recentUsers = [
    { id: 1, name: 'Rahul Sharma', email: 'rahul.s@example.com', plan: 'Premium', status: 'Active', joined: '2 hours ago' },
    { id: 2, name: 'Sneha Iyer', email: 'sneha.iyer@example.com', plan: 'Free', status: 'Pending', joined: '5 hours ago' },
    { id: 3, name: 'Aditya Desai', email: 'aditya.d@example.com', plan: 'Gold', status: 'Active', joined: '1 day ago' },
    { id: 4, name: 'Priya Joshi', email: 'priya.j@example.com', plan: 'Free', status: 'Suspended', joined: '2 days ago' },
    { id: 5, name: 'Vikram Singh', email: 'vikram.s@example.com', plan: 'Premium', status: 'Active', joined: '3 days ago' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold tracking-tight text-matrimony-400">Admin<span className="text-white">Panel</span></h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-matrimony-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'users' ? 'bg-matrimony-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5 mr-3" /> Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('subscriptions')}
            className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'subscriptions' ? 'bg-matrimony-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <CreditCard className="w-5 h-5 mr-3" /> Subscriptions
          </button>
          <button 
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center p-3 rounded-xl transition ${activeTab === 'reports' ? 'bg-matrimony-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <AlertCircle className="w-5 h-5 mr-3" /> Moderation
          </button>
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center font-bold">A</div>
            <div className="ml-3">
              <p className="text-sm font-medium">Super Admin</p>
              <p className="text-xs text-gray-500">admin@brahminmilan.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search users, IDs..." 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-matrimony-500 outline-none w-64"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${stat.bg} ${stat.color} mr-4`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    <span className={`ml-2 text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">Recent Registrations</h2>
              <button className="text-sm font-medium text-matrimony-600 hover:text-matrimony-700">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-matrimony-100 text-matrimony-600 flex items-center justify-center font-bold mr-3">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.plan === 'Premium' ? 'bg-purple-100 text-purple-700' : 
                          user.plan === 'Gold' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`flex items-center text-sm font-medium ${
                          user.status === 'Active' ? 'text-green-600' : 
                          user.status === 'Suspended' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            user.status === 'Active' ? 'bg-green-500' : 
                            user.status === 'Suspended' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          {user.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">{user.joined}</td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-green-600 transition" title="Approve">
                            <ShieldCheck className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600 transition" title="Suspend">
                            <UserX className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
