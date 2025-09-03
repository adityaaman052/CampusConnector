// ✅ File: app/threads/page.js

'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs
} from 'firebase/firestore';

export default function CampusThreadsPage() {
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('General');
  const [userEmail, setUserEmail] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [visibleComments, setVisibleComments] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        setUserEmail(user.email);

        const q = query(collection(db, 'threads'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, async snapshot => {
          const items = await Promise.all(
            snapshot.docs.map(async docSnap => {
              const data = docSnap.data();
              const id = docSnap.id;
              return { id, ...data };
            })
          );
          setThreads(items);
        });

        return () => unsubscribe();
      }
    });

    return () => unsub();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await addDoc(collection(db, 'threads'), {
      title,
      content,
      tag,
      createdBy: userEmail,
      upvotes: [],
      bookmarks: [],
      timestamp: serverTimestamp()
    });

    setTitle('');
    setContent('');
  };

  const handleUpvote = async (threadId) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      upvotes: arrayUnion(userEmail)
    });
  };

  const handleBookmark = async (threadId, isBookmarked) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      bookmarks: isBookmarked ? arrayRemove(userEmail) : arrayUnion(userEmail)
    });
  };

  const toggleComments = async (threadId) => {
    if (visibleComments[threadId]) {
      setVisibleComments(prev => ({ ...prev, [threadId]: null }));
    } else {
      const commentsSnapshot = await getDocs(collection(db, `threads/${threadId}/comments`));
      const comments = commentsSnapshot.docs.map(doc => doc.data());
      setVisibleComments(prev => ({ ...prev, [threadId]: comments }));
    }
  };

  const handleAddComment = async (threadId) => {
    const commentText = newComments[threadId]?.trim();
    if (!commentText) return;

    await addDoc(collection(db, `threads/${threadId}/comments`), {
      text: commentText,
      author: userEmail,
      timestamp: serverTimestamp()
    });

    setNewComments(prev => ({ ...prev, [threadId]: '' }));
    toggleComments(threadId); // refresh comments
  };

  const bookmarkedThreads = threads.filter(t => t.bookmarks?.includes(userEmail));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🧵</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campus Threads</h1>
                <p className="text-gray-600 text-sm">Share and discuss with your campus community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Create New Thread Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Create New Thread</h2>
          
          <form onSubmit={handlePost} className="space-y-6">
            {/* Thread Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thread Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">💭</span>
                <input
                  type="text"
                  placeholder="Enter thread title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Thread Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thread Category</label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">📂</span>
                <select 
                  value={tag} 
                  onChange={e => setTag(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 appearance-none bg-white"
                >
                  <option>General</option>
                  <option>Hostel</option>
                  <option>Academics</option>
                  <option>Internships</option>
                  <option>Complaints</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Thread Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thread Content <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="What's on your mind? Share your thoughts with the campus community..."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/1000
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => {setTitle(''); setContent('');}}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium flex items-center space-x-2"
              >
                <span>Create Thread</span>
                <span>+</span>
              </button>
            </div>
          </form>
        </div>

        {/* Bookmarks Toggle */}
        <div className="mb-6">
          <button 
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              showBookmarks 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showBookmarks ? '🔓 Hide Bookmarks' : '🔖 Show Bookmarked Threads'}
          </button>
        </div>

        {/* Bookmarked Threads */}
        {showBookmarks && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">🔖 Bookmarked Threads</h3>
            {bookmarkedThreads.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="text-gray-400 text-4xl mb-3">📚</div>
                <p className="text-gray-600">No bookmarked threads yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookmarkedThreads.map(thread => (
                  <div key={thread.id} className="bg-white rounded-xl shadow-sm border border-green-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        📌 {thread.tag}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-4">{thread.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>✍️ {thread.createdBy}</span>
                        <span>👍 {thread.upvotes?.length || 0} Upvotes</span>
                      </div>
                      <button 
                        onClick={() => handleBookmark(thread.id, true)}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200 font-medium"
                      >
                        ❌ Unbookmark
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Threads */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">🧾 All Threads</h3>
          {threads.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-4xl mb-3">💬</div>
              <p className="text-gray-600">No threads yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {threads.map(thread => (
                <div key={thread.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{thread.title}</h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      📌 {thread.tag}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{thread.content}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">✍️ {thread.createdBy}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mb-4">
                    <button 
                      onClick={() => handleUpvote(thread.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium"
                    >
                      <span>👍</span>
                      <span>{thread.upvotes?.length || 0} Upvotes</span>
                    </button>
                    
                    <button
                      onClick={() => handleBookmark(thread.id, thread.bookmarks?.includes(userEmail))}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        thread.bookmarks?.includes(userEmail)
                          ? 'bg-red-50 text-red-700 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      <span>{thread.bookmarks?.includes(userEmail) ? '❌' : '🔖'}</span>
                      <span>{thread.bookmarks?.includes(userEmail) ? 'Unbookmark' : 'Bookmark'}</span>
                    </button>
                    
                    <button 
                      onClick={() => toggleComments(thread.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                    >
                      <span>💬</span>
                      <span>{visibleComments[thread.id] ? 'Hide Comments' : 'Show Comments'}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {visibleComments[thread.id] && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Comments</h4>
                      
                      {visibleComments[thread.id].length === 0 ? (
                        <p className="text-gray-600 text-sm mb-4">No comments yet. Be the first to comment!</p>
                      ) : (
                        <div className="space-y-3 mb-4">
                          {visibleComments[thread.id].map((comment, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-gray-800 mb-1">{comment.text}</p>
                              <span className="text-sm text-gray-600 italic">— {comment.author}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Add Comment */}
                      <div className="flex space-x-3">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          value={newComments[thread.id] || ''}
                          onChange={e =>
                            setNewComments(prev => ({ ...prev, [thread.id]: e.target.value }))
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
                        />
                        <button 
                          onClick={() => handleAddComment(thread.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 font-medium"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}