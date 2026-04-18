'use client';

import { useState, useEffect, useCallback } from 'react';

interface Pickup {
  id: string;
  wasteType: string;
  weightKg: number;
  address: string;
  status: string;
  estimatedPrice: number;
  actualPrice: number | null;
  scheduledFor: string;
  createdAt: string;
  user: { name: string; phone: string };
  collector: { name: string } | null;
}

export default function AdminPickups() {
  const [pickups, setPickups] = useState<Pickup[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchPickups = useCallback(async () => {
    const token = localStorage.getItem('token');
    try {
      const url = statusFilter === 'ALL' 
        ? 'http://localhost:5000/api/pickups/all' 
        : `http://localhost:5000/api/pickups/all?status=${statusFilter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setPickups(data.pickupRequests || []);
    } catch (err) {
      console.error('Failed to fetch pickups', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPickups();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-gray-100 text-gray-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">All Pickups</h2>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-xl text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheduled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : pickups.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No pickups found</td></tr>
            ) : (
              pickups.map((pickup) => (
                <tr key={pickup.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{pickup.id.slice(0, 8)}...</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-900">{pickup.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{pickup.user?.phone || ''}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pickup.wasteType}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pickup.weightKg} kg</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">₦{pickup.actualPrice?.toLocaleString() || pickup.estimatedPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(pickup.status)}`}>
                      {pickup.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(pickup.scheduledFor).toLocaleDateString('en-NG')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
