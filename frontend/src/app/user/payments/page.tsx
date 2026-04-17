'use client';

import { useState, useEffect } from 'react';

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
  pickup: { address: string; wasteType: string } | null;
}

export default function UserPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [walletRes, paymentsRes] = await Promise.all([
        fetch('http://localhost:5000/api/payments/wallet', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('http://localhost:5000/api/payments/history', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const walletData = await walletRes.json();
      const paymentsData = await paymentsRes.json();
      setWallet(walletData.wallet);
      setPayments(paymentsData.payments || []);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments & Wallet</h1>

      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white mb-6">
        <p className="text-green-100 mb-1">Wallet Balance</p>
        <p className="text-4xl font-bold mb-4">₦{(wallet?.balance || 0).toLocaleString()}</p>
        <button className="px-4 py-2 bg-white text-green-600 rounded-xl font-medium hover:bg-green-50">
          Top Up
        </button>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment History</h2>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-gray-500">No payment history yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-200">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {payment.pickup ? `${payment.pickup.wasteType} Pickup` : 'Wallet Top Up'}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(payment.createdAt).toLocaleDateString('en-NG')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">₦{payment.amount.toLocaleString()}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
