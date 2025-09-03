'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserEmail(user.email);
    });

    // Use real-time listener for polls
    const unsubscribePolls = onSnapshot(collection(db, 'polls'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPolls(list);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching polls:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribePolls();
    };
  }, [router]);

  const handleVote = async (pollId, option) => {
    try {
      const pollRef = doc(db, 'polls', pollId);
      const poll = polls.find(p => p.id === pollId);

      if (poll.voters.includes(userEmail)) {
        alert('You already voted!');
        return;
      }

      const updatedVotes = {
        ...poll.votes,
        [option]: (poll.votes[option] || 0) + 1
      };

      await updateDoc(pollRef, {
        votes: updatedVotes,
        voters: [...poll.voters, userEmail]
      });

      alert('Vote submitted successfully!');
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const isExpired = (expiresAt) => {
    const exp = expiresAt?.toDate?.() ?? new Date(expiresAt);
    return new Date() > exp;
  };

  const getTimeRemaining = (expiresAt) => {
    const exp = expiresAt?.toDate?.() ?? new Date(expiresAt);
    const now = new Date();
    const diff = exp.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getTotalVotes = (poll) => {
    return Object.values(poll.votes || {}).reduce((sum, votes) => sum + votes, 0);
  };

  const getVotePercentage = (poll, option) => {
    const total = getTotalVotes(poll);
    const optionVotes = poll.votes[option] || 0;
    return total > 0 ? ((optionVotes / total) * 100).toFixed(1) : 0;
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'active') return !isExpired(poll.expiresAt);
    if (filter === 'expired') return isExpired(poll.expiresAt);
    if (filter === 'voted') return poll.voters.includes(userEmail);
    return true;
  });

  const sortedPolls = filteredPolls.sort((a, b) => {
    // Sort by expiration date, with active polls first
    const aExpired = isExpired(a.expiresAt);
    const bExpired = isExpired(b.expiresAt);
    
    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;
    
    const aDate = a.expiresAt?.toDate?.() ?? new Date(a.expiresAt);
    const bDate = b.expiresAt?.toDate?.() ?? new Date(b.expiresAt);
    return aDate - bDate;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <h1 className="text-xl font-bold text-gray-900">Campus Polls</h1>
                <p className="text-sm text-gray-500">Make your voice heard in campus decisions</p>
              </div>
            </div>
            
            <div className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg">
              {sortedPolls.length} polls available
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'active', label: 'Active Polls', count: polls.filter(p => !isExpired(p.expiresAt)).length },
              { key: 'voted', label: 'My Votes', count: polls.filter(p => p.voters.includes(userEmail)).length },
              { key: 'expired', label: 'Past Polls', count: polls.filter(p => isExpired(p.expiresAt)).length },
              { key: 'all', label: 'All Polls', count: polls.length }
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
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Polls List */}
        {sortedPolls.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">🗳️</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {filter === 'active' ? 'No active polls' : 
               filter === 'voted' ? 'No voted polls' :
               filter === 'expired' ? 'No past polls' : 'No polls found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'active' ? 'Check back later for new polls to participate in.' :
               filter === 'voted' ? 'Vote on active polls to see them here.' :
               'Try switching to a different filter.'}
            </p>
            {filter !== 'active' && (
              <button
                onClick={() => setFilter('active')}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
              >
                View active polls
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPolls.map((poll) => {
              const expired = isExpired(poll.expiresAt);
              const hasVoted = poll.voters.includes(userEmail);
              const totalVotes = getTotalVotes(poll);
              
              return (
                <div
                  key={poll.id}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden hover:shadow-md transition-all duration-200 ${
                    expired ? 'border-l-gray-400 opacity-75' :
                    hasVoted ? 'border-l-green-500' :
                    'border-l-indigo-500'
                  }`}
                >
                  <div className="p-6">
                    {/* Poll Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {expired ? '⏰' : hasVoted ? '✅' : '🗳️'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            expired ? 'bg-gray-100 text-gray-600' :
                            hasVoted ? 'bg-green-100 text-green-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            {expired ? '⏰ Expired' : hasVoted ? '✅ Voted' : '🔴 Active'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 leading-tight mb-2">
                          {poll.question}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{getTimeRemaining(poll.expiresAt)}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>{totalVotes} votes</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Poll Options */}
                    <div className="space-y-3">
                      {poll.options.map((option, idx) => {
                        const votes = poll.votes[option] || 0;
                        const percentage = getVotePercentage(poll, option);
                        const isSelected = hasVoted; // Show results if user has voted
                        
                        return (
                          <div key={idx} className="relative">
                            {expired || hasVoted ? (
                              // Show results
                              <div className="relative">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                  <span className="font-medium text-gray-900">{option}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{votes} votes</span>
                                    <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                                  </div>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-indigo-500 rounded-b-lg transition-all duration-500"
                                     style={{ width: `${percentage}%` }}>
                                </div>
                              </div>
                            ) : (
                              // Show voting button
                              <button
                                onClick={() => handleVote(poll.id, option)}
                                className="w-full p-4 text-left bg-white border border-gray-200 rounded-lg font-medium text-gray-900 hover:bg-indigo-50 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.01]"
                              >
                                <div className="flex items-center justify-between">
                                  <span>{option}</span>
                                  <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Poll Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>
                          Expires: {new Date(poll.expiresAt?.toDate?.() ?? poll.expiresAt).toLocaleDateString()}
                        </span>
                        <span>
                          {poll.voters.length} participants
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600">🗳️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Polls</p>
                <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">🔴</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(p => !isExpired(p.expiresAt)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">My Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(p => p.voters.includes(userEmail)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">📊</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + getTotalVotes(poll), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}