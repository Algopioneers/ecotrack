'use client';

import { useState, useEffect } from 'react';

interface RewardData {
  totalPoints: number;
  currentTier: { name: string; cashbackPercent: number } | null;
  nextTier: { name: string; pointsNeeded: number } | null;
  referralCode: string;
  referralEarnings: number;
}

export default function UserRewards() {
  const [rewards, setRewards] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/rewards', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setRewards(data);
    } catch (err) {
      console.error('Failed to fetch rewards', err);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (rewards?.referralCode) {
      navigator.clipboard.writeText(rewards.referralCode);
      alert('Referral code copied!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rewards & Referrals</h1>

      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-purple-100 mb-1">Your Points Balance</p>
        <p className="text-5xl font-bold mb-2">{rewards?.totalPoints || 0}</p>
        {rewards?.currentTier && (
          <p className="text-purple-100">{rewards.currentTier.name} Tier - {rewards.currentTier.cashbackPercent * 100}% cashback</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Referral Program</h3>
          <div className="bg-green-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">Your Referral Code</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-green-600">{rewards?.referralCode || 'N/A'}</span>
              <button
                onClick={copyReferralCode}
                className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Earn 500 points when someone signs up with your code!
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Referral Earnings</h3>
          <p className="text-3xl font-bold text-purple-600 mb-2">{rewards?.referralEarnings || 0}</p>
          <p className="text-sm text-gray-500">points earned from referrals</p>
        </div>
      </div>

      {rewards?.nextTier && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Next Tier</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{rewards.nextTier.name}</p>
              <p className="text-sm text-gray-500">{rewards.nextTier.pointsNeeded} more points needed</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                <div
                  className="h-2 bg-purple-500 rounded-full"
                  style={{ width: `${Math.min(100, (rewards.totalPoints / (rewards.totalPoints + rewards.nextTier.pointsNeeded)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Redeem Points</h3>
        <div className="grid grid-cols-2 gap-4">
          <button className="p-4 border rounded-xl text-left hover:border-green-500 hover:bg-green-50">
            <p className="font-medium text-gray-900">Airtime</p>
            <p className="text-sm text-gray-500">Convert points to airtime</p>
          </button>
          <button className="p-4 border rounded-xl text-left hover:border-green-500 hover:bg-green-50">
            <p className="font-medium text-gray-900">Wallet Credit</p>
            <p className="text-sm text-gray-500">1 point = ₦1</p>
          </button>
          <button className="p-4 border rounded-xl text-left hover:border-green-500 hover:bg-green-50">
            <p className="font-medium text-gray-900">Discount Code</p>
            <p className="text-sm text-gray-500">Get discounts on pickups</p>
          </button>
          <button className="p-4 border rounded-xl text-left hover:border-green-500 hover:bg-green-50">
            <p className="font-medium text-gray-900">Utility Bills</p>
            <p className="text-sm text-gray-500">Pay bills with points</p>
          </button>
        </div>
      </div>
    </div>
  );
}
