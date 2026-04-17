'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WASTE_TYPES = [
  { value: 'ORGANIC', label: 'Organic (Food & Garden)', color: 'bg-green-600' },
  { value: 'PLASTIC', label: 'Plastic (Bottles & Containers)', color: 'bg-blue-600' },
  { value: 'PAPER', label: 'Paper (Cardboard & Newspapers)', color: 'bg-yellow-600' },
  { value: 'METAL', label: 'Metal (Cans & Scrap)', color: 'bg-gray-600' },
  { value: 'GLASS', label: 'Glass (Bottles & Jars)', color: 'bg-teal-600' },
  { value: 'ELECTRONIC', label: 'Electronic (E-Waste)', color: 'bg-purple-600' },
  { value: 'HAZARDOUS', label: 'Hazardous (Batteries & Chemicals)', color: 'bg-red-600' },
  { value: 'MIXED', label: 'Mixed (General Waste)', color: 'bg-amber-600' },
  { value: 'BULKY', label: 'Bulky (Furniture & Appliances)', color: 'bg-indigo-600' },
];

export default function NewPickupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    wasteType: 'MIXED',
    weightKg: '',
    address: '',
    latitude: '6.5244',
    longitude: '3.3792',
    scheduledFor: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/pickups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          weightKg: parseFloat(formData.weightKg),
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create pickup request');
        setLoading(false);
        return;
      }

      router.push('/user/dashboard');
    } catch (err) {
      setError('Unable to connect to server');
      setLoading(false);
    }
  };

  const estimatedPrice = () => {
    const weight = parseFloat(formData.weightKg) || 0;
    const prices: Record<string, number> = {
      ORGANIC: 50, PLASTIC: 100, PAPER: 30, METAL: 150, GLASS: 80,
      ELECTRONIC: 200, HAZARDOUS: 500, MIXED: 75, BULKY: 200,
    };
    return (weight * (prices[formData.wasteType] || 75)).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Schedule New Pickup</h1>
          <p className="text-gray-500 mt-1">Book a waste collection at your preferred time</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Waste Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {WASTE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, wasteType: type.value })}
                  className={`p-3 rounded-xl text-left transition-all ${
                    formData.wasteType === type.value
                      ? `${type.color} text-white ring-2 ring-offset-2 ring-green-500`
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Weight (kg)
                </label>
                <input
                  type="number"
                  required
                  min="0.1"
                  max="1000"
                  step="0.1"
                  className="eco-input"
                  placeholder="e.g., 5.5"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Address
                </label>
                <textarea
                  required
                  rows={3}
                  className="eco-input"
                  placeholder="Enter your full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="eco-input"
                    placeholder="6.5244"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="eco-input"
                    placeholder="3.3792"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  className="eco-input"
                  min={new Date().toISOString().slice(0, 16)}
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (optional)
                </label>
                <textarea
                  rows={2}
                  className="eco-input"
                  placeholder="Any special instructions for the collector..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Estimated Price</span>
              <span className="text-2xl font-bold text-green-600">₦{estimatedPrice()}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Schedule Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
