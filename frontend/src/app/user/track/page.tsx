'use client';

import { useState } from 'react';

export default function TrackCollector() {
  const [pickupId, setPickupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Track Your Collector</h1>
      
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
        <form onSubmit={handleTrack} className="flex gap-4">
          <input
            type="text"
            value={pickupId}
            onChange={(e) => setPickupId(e.target.value)}
            placeholder="Enter Pickup ID"
            className="flex-1 eco-input"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Enter a Pickup ID to track</h3>
        <p className="text-gray-500">You can find your Pickup ID in your pickup history</p>
      </div>
    </div>
  );
}
