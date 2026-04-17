'use client';

import { useState, useEffect } from 'react';

interface Stats {
  totalUsers: number;
  totalCollectors: number;
  totalPickups: number;
  completedPickups: number;
  pendingPickups: number;
  totalRevenue: number;
  completionRate: number;
  pickupGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Users" value={stats?.totalUsers || 0} icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        <StatCard label="Total Pickups" value={stats?.totalPickups || 0} icon="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        <StatCard label="Completed" value={stats?.completedPickups || 0} icon="M5 13l4 4L19 7" color="text-green-600" />
        <StatCard label="Pending" value={stats?.pendingPickups || 0} icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="text-yellow-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₦{(stats?.totalRevenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Completion Rate</h3>
          <p className="text-3xl font-bold text-blue-600">{stats?.completionRate || 0}%</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Growth Rate</h3>
          <p className="text-3xl font-bold text-purple-600">{stats?.pickupGrowth || 0}%</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color = "text-green-600" }: { label: string; value: number; icon: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <svg className={`w-6 h-6 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}
