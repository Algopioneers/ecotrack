'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  keywords: string | null;
  status: string;
  pageType: string;
  featuredImage: string | null;
}

export default function EditCMSPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    slug: '',
    title: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    status: 'DRAFT',
    pageType: 'CUSTOM',
    featuredImage: '',
  });

  useEffect(() => {
    fetchPage();
  }, [params.id]);

  const fetchPage = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cms/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Page not found');
      const data = await res.json();
      const page = data.page;
      setForm({
        slug: page.slug || '',
        title: page.title || '',
        content: page.content || '',
        metaTitle: page.metaTitle || '',
        metaDescription: page.metaDescription || '',
        keywords: page.keywords || '',
        status: page.status || 'DRAFT',
        pageType: page.pageType || 'CUSTOM',
        featuredImage: page.featuredImage || '',
      });
    } catch (err) {
      setError('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cms/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update page');
      }
      router.push('/admin/cms');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h2 className="text-lg font-semibold text-gray-800">Edit Page</h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                required
                className="eco-input w-full"
                placeholder="Page title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                name="slug"
                value={form.slug}
                onChange={handleChange}
                required
                pattern="[a-z0-9-]+"
                className="eco-input w-full"
                placeholder="page-slug"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              required
              rows={15}
              className="eco-input w-full font-mono text-sm"
              placeholder="Page content (HTML supported)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Page Type</label>
              <select name="pageType" value={form.pageType} onChange={handleChange} className="eco-input w-full">
                <option value="ABOUT">About Us</option>
                <option value="CONTACT">Contact</option>
                <option value="PRIVACY">Privacy Policy</option>
                <option value="TERMS">Terms of Service</option>
                <option value="FAQ">FAQ</option>
                <option value="BLOG">Blog</option>
                <option value="CUSTOM">Custom Page</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="eco-input w-full">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image URL</label>
            <input
              type="url"
              name="featuredImage"
              value={form.featuredImage}
              onChange={handleChange}
              className="eco-input w-full"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="font-medium text-gray-800 mb-4">SEO Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={form.metaTitle}
                onChange={handleChange}
                maxLength={60}
                className="eco-input w-full"
                placeholder="SEO title (max 60 chars)"
              />
              <p className="text-xs text-gray-500 mt-1">{form.metaTitle.length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
              <textarea
                name="metaDescription"
                value={form.metaDescription}
                onChange={handleChange}
                maxLength={160}
                rows={2}
                className="eco-input w-full"
                placeholder="SEO description (max 160 chars)"
              />
              <p className="text-xs text-gray-500 mt-1">{form.metaDescription.length}/160 characters</p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
            <input
              type="text"
              name="keywords"
              value={form.keywords}
              onChange={handleChange}
              className="eco-input w-full"
              placeholder="keyword1, keyword2, keyword3"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link href="/admin/cms" className="px-6 py-2 border border-gray-300 rounded-xl hover:bg-gray-50">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
