'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function FeedPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAnnouncements(data);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching announcements:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getAnnouncementIcon = (title = '') => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('event')) return '📅';
    if (titleLower.includes('exam') || titleLower.includes('test')) return '📝';
    if (titleLower.includes('holiday') || titleLower.includes('break')) return '🏖️';
    if (titleLower.includes('deadline')) return '⏰';
    if (titleLower.includes('registration')) return '📋';
    if (titleLower.includes('meeting')) return '👥';
    return '📢';
  };

  const getPriorityLevel = (title = '', description = '') => {
    const content = (title + ' ' + description).toLowerCase();
    if (content.includes('urgent') || content.includes('important') || content.includes('deadline')) {
      return 'high';
    }
    if (content.includes('reminder') || content.includes('update')) {
      return 'medium';
    }
    return 'normal';
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (filter === 'all') return true;
    return getPriorityLevel(announcement.title, announcement.desc) === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📰</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Announcements</h1>
                <p className="text-sm text-gray-500">Stay updated with the latest news</p>
              </div>
            </div>
            
            <div className="text-sm bg-orange-50 text-orange-700 px-3 py-1 rounded-lg">
              {filteredAnnouncements.length} announcements
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All', count: announcements.length },
              { key: 'high', label: 'Important', count: announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'high').length },
              { key: 'medium', label: 'Updates', count: announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'medium').length },
              { key: 'normal', label: 'General', count: announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'normal').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    filter === tab.key
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Announcements Feed */}
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">📰</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No announcements yet' : `No ${filter} priority announcements`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Check back later for campus updates and news.'
                : 'Try switching to a different filter to see more announcements.'
              }
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View all announcements
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredAnnouncements.map((announcement) => {
              const priority = getPriorityLevel(announcement.title, announcement.desc);
              return (
                <article
                  key={announcement.id}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition-all duration-200 ${
                    priority === 'high' 
                      ? 'border-l-red-500' 
                      : priority === 'medium'
                      ? 'border-l-yellow-500'
                      : 'border-l-blue-500'
                  }`}
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          priority === 'high' 
                            ? 'bg-red-100' 
                            : priority === 'medium'
                            ? 'bg-yellow-100'
                            : 'bg-blue-100'
                        }`}>
                          <span className="text-2xl">
                            {getAnnouncementIcon(announcement.title)}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                            {announcement.title}
                          </h2>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              priority === 'high' 
                                ? 'bg-red-100 text-red-700' 
                                : priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {priority === 'high' ? '🔴 Important' : priority === 'medium' ? '🟡 Update' : '🔵 General'}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {getTimeAgo(announcement.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {announcement.desc}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{formatDate(announcement.createdAt)}</span>
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                          </svg>
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">📢</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600">🔴</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Important</p>
                <p className="text-2xl font-bold text-gray-900">
                  {announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'high').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600">🟡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Updates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'medium').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">🔵</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">General</p>
                <p className="text-2xl font-bold text-gray-900">
                  {announcements.filter(a => getPriorityLevel(a.title, a.desc) === 'normal').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}