'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import {
  addDoc,
  collection,
  Timestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UploadEventPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          alert('Access denied. Admins only.');
          router.push('/');
        } else {
          setLoading(false);
        }
      });
    };

    checkAccess();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        desc,
        createdAt: Timestamp.now()
      });
      alert('Announcement posted!');
      setTitle('');
      setDesc('');
    } catch (error) {
      console.error(error);
      alert('Error posting announcement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">📢</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Post Announcement</h1>
                <p className="text-gray-600 text-sm">Share important updates with the campus community</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <span>👑</span>
              <span>Admin Only</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create New Announcement</h2>
            <p className="text-gray-600">Share important information and updates with all campus members</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Announcement Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">📋</span>
                <input
                  type="text"
                  placeholder="Enter announcement title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Announcement Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Announcement Description <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="Write your announcement details here. Be clear and informative to help students understand the important information you're sharing..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {desc.length}/1000
              </div>
            </div>

            {/* Preview Card */}
            {(title || desc) && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">📢</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {title || 'Announcement Title'}
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {desc || 'Announcement description will appear here...'}
                      </p>
                      <div className="mt-2 text-xs text-gray-500">
                        Just now • Admin
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={() => {setTitle(''); setDesc('');}}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={submitting || !title.trim() || !desc.trim()}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <span>Post Announcement</span>
                    <span>📢</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 mb-2">Tips for Effective Announcements</h3>
              <ul className="text-amber-800 text-sm space-y-1">
                <li>• Keep titles clear and concise</li>
                <li>• Include all important details in the description</li>
                <li>• Use proper formatting for dates, times, and locations</li>
                <li>• Double-check for typos before posting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}