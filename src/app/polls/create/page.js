'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function CreatePollPage() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [expiry, setExpiry] = useState('');
  const [category, setCategory] = useState('general');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [checking, setChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        const userRole = userDoc.exists() ? userDoc.data().role : '';
        setRole(userRole);
        setChecking(false);

        if (userRole !== 'admin') {
          alert('Only admins can create polls');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        router.push('/dashboard');
      }
    });

    return unsubscribe;
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      const cleanOptions = options.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
      
      if (cleanOptions.length < 2) {
        alert('Please provide at least 2 options for the poll');
        setIsSubmitting(false);
        return;
      }

      const votes = Object.fromEntries(cleanOptions.map(opt => [opt, 0]));

      await addDoc(collection(db, 'polls'), {
        question,
        description: description || '',
        category,
        options: cleanOptions,
        votes,
        createdBy: user.email,
        createdAt: serverTimestamp(),
        expiresAt: new Date(expiry),
        voters: [],
      });

      alert('Poll created successfully!');
      router.push('/polls');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionsList = () => {
    return options.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);
  };

  const getPollIcon = (category) => {
    const icons = {
      general: '📊',
      academic: '🎓',
      campus: '🏫',
      events: '📅',
      facilities: '🏢',
      sports: '⚽',
      dining: '🍽️',
      feedback: '💭'
    };
    return icons[category] || '📊';
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">❌</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only administrators can create polls.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Return to Dashboard
          </button>
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
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">🗳️</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create New Poll</h1>
                <p className="text-sm text-gray-500">Gather opinions from the campus community</p>
              </div>
            </div>
            
            <div className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-lg">
              👑 Admin Only
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Poll Question */}
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Question *
                </label>
                <div className="relative">
                  <textarea
                    id="question"
                    placeholder="What would you like to ask the campus community?"
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-vertical"
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {question.length}/200
                  </div>
                </div>
              </div>

              {/* Poll Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-12 appearance-none bg-white"
                  >
                    <option value="general">📊 General</option>
                    <option value="academic">🎓 Academic</option>
                    <option value="campus">🏫 Campus Life</option>
                    <option value="events">📅 Events</option>
                    <option value="facilities">🏢 Facilities</option>
                    <option value="sports">⚽ Sports</option>
                    <option value="dining">🍽️ Dining</option>
                    <option value="feedback">💭 Feedback</option>
                  </select>
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lg">
                    {getPollIcon(category)}
                  </span>
                  <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  placeholder="Provide additional context or details about this poll..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-vertical"
                />
              </div>

              {/* Poll Options */}
              <div>
                <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Options *
                </label>
                <div className="relative">
                  <textarea
                    id="options"
                    placeholder="Enter options separated by commas (e.g., Option 1, Option 2, Option 3)"
                    required
                    value={options}
                    onChange={(e) => setOptions(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-12"
                  />
                  <svg className="absolute left-4 top-4 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                
                {/* Options Preview */}
                {options.trim() && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Preview Options:</p>
                    <div className="space-y-1">
                      {getOptionsList().map((option, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                          <span className={option ? 'text-gray-900' : 'text-red-500'}>
                            {option || '(Empty option)'}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {getOptionsList().length} options • Minimum 2 required
                    </p>
                  </div>
                )}
              </div>

              {/* Expiry Date */}
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                  Poll Expires At *
                </label>
                <div className="relative">
                  <input
                    id="expiry"
                    type="datetime-local"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 pl-12"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                {expiry && (
                  <p className="mt-1 text-sm text-gray-500">
                    Poll will expire: {new Date(expiry).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || !question.trim() || !options.trim() || !expiry || getOptionsList().length < 2}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Poll...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Poll</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600">💡</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Poll Creation Tips</h3>
              <ul className="text-sm text-indigo-700 space-y-1">
                <li>• Write clear, unbiased questions that are easy to understand</li>
                <li>• Provide at least 2 options, but keep the list manageable (3-5 options work best)</li>
                <li>• Choose an appropriate expiry time - not too short, not too long</li>
                <li>• Use categories to help users find relevant polls</li>
                <li>• Add descriptions for complex topics that need context</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Poll Preview */}
        {(question || options) && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>👁️</span>
              <span>Poll Preview</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-indigo-500">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{getPollIcon(category)}</span>
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {question || 'Your poll question will appear here...'}
              </h4>
              {description && (
                <p className="text-gray-600 text-sm mb-3">{description}</p>
              )}
              <div className="space-y-2">
                {getOptionsList().length > 0 ? (
                  getOptionsList().map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2 p-2 bg-white rounded border">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <span className="text-sm">{option}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">Poll options will appear here...</p>
                )}
              </div>
              {expiry && (
                <p className="text-xs text-gray-500 mt-3">
                  Expires: {new Date(expiry).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}