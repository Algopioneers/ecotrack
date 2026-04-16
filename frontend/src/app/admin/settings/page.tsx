'use client';

import { useState, useEffect } from 'react';

interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  keywords: string;
  author: string;
  ogImage: string;
  favicon: string;
  logo: string;
  logoAlt: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialFacebook: string;
  socialTwitter: string;
  socialInstagram: string;
  socialLinkedIn: string;
  analyticsCode: string;
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage('Settings saved successfully!');
      } else {
        setMessage('Failed to save settings');
      }
    } catch (err) {
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'seo', label: 'SEO' },
    { id: 'logo', label: 'Logo & Branding' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'social', label: 'Social Media' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Site Settings</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl ${message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings?.siteName || ''}
                  onChange={(e) => setSettings({ ...settings!, siteName: e.target.value })}
                  className="eco-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings?.tagline || ''}
                  onChange={(e) => setSettings({ ...settings!, tagline: e.target.value })}
                  className="eco-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={settings?.description || ''}
                  onChange={(e) => setSettings({ ...settings!, description: e.target.value })}
                  className="eco-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings?.siteName || ''}
                  onChange={(e) => setSettings({ ...settings!, siteName: e.target.value })}
                  className="eco-input"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  rows={3}
                  value={settings?.description || ''}
                  onChange={(e) => setSettings({ ...settings!, description: e.target.value })}
                  className="eco-input"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 150-160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <input
                  type="text"
                  value={settings?.keywords || ''}
                  onChange={(e) => setSettings({ ...settings!, keywords: e.target.value })}
                  className="eco-input"
                  placeholder="waste management, recycling, eco-friendly"
                />
                <p className="text-xs text-gray-500 mt-1">Comma-separated keywords</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={settings?.author || ''}
                  onChange={(e) => setSettings({ ...settings!, author: e.target.value })}
                  className="eco-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">OG Image URL</label>
                <input
                  type="url"
                  value={settings?.ogImage || ''}
                  onChange={(e) => setSettings({ ...settings!, ogImage: e.target.value })}
                  className="eco-input"
                  placeholder="https://example.com/og-image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended size: 1200x630px</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics Code</label>
                <input
                  type="text"
                  value={settings?.analyticsCode || ''}
                  onChange={(e) => setSettings({ ...settings!, analyticsCode: e.target.value })}
                  className="eco-input"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
            </div>
          )}

          {activeTab === 'logo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                <input
                  type="url"
                  value={settings?.logo || ''}
                  onChange={(e) => setSettings({ ...settings!, logo: e.target.value })}
                  className="eco-input"
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 200x60px, PNG or SVG</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo Alt Text</label>
                <input
                  type="text"
                  value={settings?.logoAlt || ''}
                  onChange={(e) => setSettings({ ...settings!, logoAlt: e.target.value })}
                  className="eco-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                <input
                  type="url"
                  value={settings?.favicon || ''}
                  onChange={(e) => setSettings({ ...settings!, favicon: e.target.value })}
                  className="eco-input"
                  placeholder="https://example.com/favicon.ico"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px or 16x16px, ICO format</p>
              </div>
              {settings?.logo && (
                <div className="border rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">Logo Preview</p>
                  <img src={settings.logo} alt="Logo preview" className="h-12" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                <input
                  type="email"
                  value={settings?.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings!, contactEmail: e.target.value })}
                  className="eco-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
                <input
                  type="tel"
                  value={settings?.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings!, contactPhone: e.target.value })}
                  className="eco-input"
                  placeholder="+234 800 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Address</label>
                <textarea
                  rows={3}
                  value={settings?.contactAddress || ''}
                  onChange={(e) => setSettings({ ...settings!, contactAddress: e.target.value })}
                  className="eco-input"
                />
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                <input
                  type="url"
                  value={settings?.socialFacebook || ''}
                  onChange={(e) => setSettings({ ...settings!, socialFacebook: e.target.value })}
                  className="eco-input"
                  placeholder="https://facebook.com/ecotrack"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                <input
                  type="url"
                  value={settings?.socialTwitter || ''}
                  onChange={(e) => setSettings({ ...settings!, socialTwitter: e.target.value })}
                  className="eco-input"
                  placeholder="https://twitter.com/ecotrack"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                <input
                  type="url"
                  value={settings?.socialInstagram || ''}
                  onChange={(e) => setSettings({ ...settings!, socialInstagram: e.target.value })}
                  className="eco-input"
                  placeholder="https://instagram.com/ecotrack"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                <input
                  type="url"
                  value={settings?.socialLinkedIn || ''}
                  onChange={(e) => setSettings({ ...settings!, socialLinkedIn: e.target.value })}
                  className="eco-input"
                  placeholder="https://linkedin.com/company/ecotrack"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
