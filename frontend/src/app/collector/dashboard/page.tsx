'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CollectorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ activePickups: 0, completedToday: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <span className="text-xl font-bold text-gray-900">EcoTrack</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Collector</span>
        </div>
        <Link href="/" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="text-gray-600 hover:text-gray-900 cursor-pointer">Logout</Link>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Collector Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-2">Active Pickups</p>
            <p className="text-3xl font-bold text-blue-600">{stats.activePickups}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-2">Completed Today</p>
            <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-sm text-gray-500 mb-2">Total Earnings</p>
            <p className="text-3xl font-bold text-purple-600">₦{stats.earnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Available Pickups</h2>
          <p className="text-gray-500">No available pickups at the moment.</p>
        </div>
      </main>
    </div>
  );
}
