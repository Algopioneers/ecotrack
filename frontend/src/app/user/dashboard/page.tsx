'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UserDashboard() {
  const [stats] = useState({
    totalPickups: 12,
    co2Saved: 245,
    points: 1250,
    nextPickup: 'Tomorrow, 9:00 AM'
  });

  const recentPickups = [
    { id: 1, type: 'Mixed', status: 'Completed', date: '2024-01-10', amount: 1500 },
    { id: 2, type: 'Plastic', status: 'Completed', date: '2024-01-07', amount: 2000 },
    { id: 3, type: 'Organic', status: 'Completed', date: '2024-01-03', amount: 1000 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Welcome back, John!</h1>
          <p className="text-navy-500">Here's your waste management overview</p>
        </div>
        <Link href="/user/pickup/new" className="eco-btn-primary mt-4 md:mt-0 inline-flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Schedule Pickup</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="eco-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="icon-circle-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <span className="text-sm text-navy-500">Total Pickups</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">{stats.totalPickups}</p>
        </div>

        <div className="eco-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="icon-circle-navy">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-navy-500">CO₂ Saved</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">{stats.co2Saved} kg</p>
          <span className="eco-impact mt-1 inline-block">8% improvement</span>
        </div>

        <div className="eco-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="icon-circle-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <span className="text-sm text-navy-500">Reward Points</span>
          </div>
          <p className="text-3xl font-bold text-navy-900">{stats.points}</p>
        </div>

        <div className="eco-card">
          <div className="flex items-center space-x-3 mb-2">
            <div className="live-indicator">
              <div className="w-8 h-8 icon-circle-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <span className="text-sm text-navy-500">Next Pickup</span>
          </div>
          <p className="text-lg font-bold text-navy-900">{stats.nextPickup}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/user/track" className="eco-card flex items-center space-x-4 hover:border-primary-200">
          <div className="icon-circle-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">Track Collector</h3>
            <p className="text-sm text-navy-500">Real-time tracking</p>
          </div>
        </Link>

        <Link href="/user/payments" className="eco-card flex items-center space-x-4 hover:border-primary-200">
          <div className="icon-circle-navy">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">Top Up Wallet</h3>
            <p className="text-sm text-navy-500">Add funds quickly</p>
          </div>
        </Link>

        <Link href="/user/rewards" className="eco-card flex items-center space-x-4 hover:border-primary-200">
          <div className="icon-circle-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-navy-900">Redeem Rewards</h3>
            <p className="text-sm text-navy-500">Airtime & discounts</p>
          </div>
        </Link>
      </div>

      {/* Recent Pickups */}
      <div className="eco-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-navy-900">Recent Pickups</h2>
          <Link href="/user/pickups" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentPickups.map((pickup) => (
            <div key={pickup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-navy-900">{pickup.type} Waste</p>
                  <p className="text-sm text-navy-500">{pickup.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="status-badge bg-green-100 text-green-800">{pickup.status}</span>
                <p className="text-sm font-medium text-navy-900 mt-1">₦{pickup.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}