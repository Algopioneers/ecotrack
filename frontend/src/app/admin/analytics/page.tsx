'use client';

import { useState, useEffect } from 'react';

export default function AdminAnalytics() {
  const [revenue, setRevenue] = useState<any>(null);
  const [pickups, setPickups] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem('token');
    try {
      const [revRes, pickupRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/revenue?period=30', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/admin/pickups?period=30', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const revData = await revRes.json();
      const pickupData = await pickupRes.json();
      setRevenue(revData);
      setPickups(pickupData);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Analytics Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue (30 days)</h3>
          <p className="text-3xl font-bold text-green-600">₦{(revenue?.totalRevenue || 0).toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-2">{revenue?.transactionCount || 0} transactions</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pickups (30 days)</h3>
          <p className="text-3xl font-bold text-blue-600">{pickups?.totalPickups || 0}</p>
          <p className="text-sm text-gray-500 mt-2">{pickups?.completedPickups || 0} completed</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Transaction</h3>
          <p className="text-3xl font-bold text-purple-600">₦{(revenue?.avgTransaction || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Waste Type Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {pickups?.wasteTypeDistribution?.map((item: any) => (
            <div key={item.type} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{item.count}</p>
              <p className="text-sm text-gray-500">{item.type}</p>
            </div>
          )) || <p className="text-gray-500">No data available</p>}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h3>
        <div className="flex flex-wrap gap-4">
          {pickups?.statusDistribution?.map((item: any) => (
            <div key={item.status} className="px-4 py-2 bg-gray-50 rounded-xl">
              <span className="font-medium text-gray-900">{item.count}</span>
              <span className="text-gray-500 ml-2">{item.status}</span>
            </div>
          )) || <p className="text-gray-500">No data available</p>}
        </div>
      </div>
    </div>
  );
}
