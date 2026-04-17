'use client';

import { useState, useEffect, useCallback } from 'react';

interface Pickup {
  id: string;
  wasteType: string;
  weightKg: number;
  address: string;
  status: string;
  estimatedPrice: number;
  scheduledFor: string;
  createdAt: string;
  collector: { name: string; phone: string } | null;
}

export default function UserPickups() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchPickups();
  }, [filter]);

  const fetchPickups = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const url = filter === 'ALL' 
        ? 'http://localhost:5000/api/pickups' 
        : `http://localhost:5000/api/pickups?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPickups(data.pickupRequests || []);
    } catch (err) {
      console.error('Failed to fetch pickups', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Pickups</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-xl text-sm"
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : pickups.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pickups found</h3>
          <p className="text-gray-500 mb-4">Schedule your first waste pickup today</p>
          <a href="/user/pickup/new" className="inline-block px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600">
            Schedule Pickup
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => (
            <div key={pickup.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pickup.status)}`}>
                    {pickup.status}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{pickup.wasteType} Waste</h3>
                </div>
                <p className="text-lg font-bold text-green-600">₦{pickup.estimatedPrice.toLocaleString()}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Weight:</span> {pickup.weightKg} kg
                </div>
                <div>
                  <span className="font-medium">Scheduled:</span> {new Date(pickup.scheduledFor).toLocaleString('en-NG')}
                </div>
                <div className="col-span-2">
                  <span className="font-medium">Address:</span> {pickup.address}
                </div>
                {pickup.collector && (
                  <div className="col-span-2">
                    <span className="font-medium">Collector:</span> {pickup.collector.name}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50">
                  View Details
                </button>
                {pickup.status === 'PENDING' && (
                  <button className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
