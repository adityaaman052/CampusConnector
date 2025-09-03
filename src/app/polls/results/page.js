'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../../lib/firebase';
import { collection, getDocs, getDoc, doc as docRef, onSnapshot } from 'firebase/firestore';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  ArcElement, 
  Tooltip, 
  Legend,
  Title
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend, Title);

export default function PollResultsPage() {
  const [polls, setPolls] = useState([]);
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [chartType, setChartType] = useState('bar');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDoc = await getDoc(docRef(db, 'users', user.email));
        const userRole = userDoc?.data()?.role;
        setRole(userRole);

        if (userRole !== 'admin') {
          alert('Only admins can view poll results.');
          router.push('/dashboard');
          return;
        }

        // Use real-time listener for polls
        const unsubscribePolls = onSnapshot(collection(db, 'polls'), (snapshot) => {
          const now = new Date();
          const list = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            expired: now > (doc.data().expiresAt?.toDate?.() ?? new Date(doc.data().expiresAt)),
          }));
          setPolls(list);
          setIsLoading(false);
        });

        return () => unsubscribePolls();
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getWinningOption = (poll) => {
    const votes = poll.votes || {};
    const labels = Object.keys(votes);
    const values = Object.values(votes);
    
    if (labels.length === 0) return null;
    
    const maxVotes = Math.max(...values);
    if (maxVotes === 0) return null;
    
    const winners = labels.filter(label => votes[label] === maxVotes);
    return winners.length === 1 ? winners[0] : `Tie: ${winners.join(', ')}`;
  };

  const getTotalVotes = (poll) => {
    const votes = poll.votes || {};
    return Object.values(votes).reduce((sum, count) => sum + count, 0);
  };

  const getVotePercentage = (poll, option) => {
    const total = getTotalVotes(poll);
    const optionVotes = poll.votes[option] || 0;
    return total > 0 ? ((optionVotes / total) * 100).toFixed(1) : 0;
  };

  const generateChartColors = (count) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 101, 101, 0.8)',  // Red
      'rgba(251, 191, 36, 0.8)',   // Yellow
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(6, 182, 212, 0.8)',    // Cyan
      'rgba(251, 146, 60, 0.8)',   // Orange
    ];
    return colors.slice(0, count);
  };

  const getChartData = (poll) => {
    const votes = poll.votes || {};
    const labels = Object.keys(votes);
    const values = Object.values(votes);
    const colors = generateChartColors(labels.length);

    return {
      labels,
      datasets: [
        {
          label: 'Votes',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartType === 'doughnut',
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const poll = polls.find(p => p.question === context.chart.canvas.getAttribute('data-question'));
            const percentage = getVotePercentage(poll, context.label);
            return `${context.label}: ${context.parsed} votes (${percentage}%)`;
          }
        }
      }
    },
    scales: chartType === 'bar' ? {
      y: { 
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      },
    } : {},
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'active') return !poll.expired;
    if (filter === 'expired') return poll.expired;
    if (filter === 'with-votes') return getTotalVotes(poll) > 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading poll results...</p>
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
          <p className="text-gray-600 mb-6">Only administrators can view poll results.</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Poll Results Dashboard</h1>
                <p className="text-sm text-gray-500">Analyze campus poll data and insights</p>
              </div>
            </div>
            
            <div className="text-sm bg-red-50 text-red-700 px-3 py-1 rounded-lg">
              👑 Admin Only
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'all', label: 'All Polls', count: polls.length },
              { key: 'active', label: 'Active', count: polls.filter(p => !p.expired).length },
              { key: 'expired', label: 'Ended', count: polls.filter(p => p.expired).length },
              { key: 'with-votes', label: 'With Votes', count: polls.filter(p => getTotalVotes(p) > 0).length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.key
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setChartType('bar')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'bar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Bar Chart
            </button>
            <button
              onClick={() => setChartType('doughnut')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                chartType === 'doughnut'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🍩 Doughnut
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">📊</span>
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
                <p className="text-sm text-gray-600">Active Polls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.filter(p => !p.expired).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">📈</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.reduce((sum, poll) => sum + getTotalVotes(poll), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <span className="text-orange-600">👥</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Participation</p>
                <p className="text-2xl font-bold text-gray-900">
                  {polls.length > 0 ? Math.round(polls.reduce((sum, poll) => sum + getTotalVotes(poll), 0) / polls.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Poll Results */}
        {filteredPolls.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">📊</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No polls found</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? 'No polls have been created yet.' : 
               `No ${filter.replace('-', ' ')} polls available.`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                View all polls
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPolls.map((poll) => {
              const votes = poll.votes || {};
              const labels = Object.keys(votes);
              const totalVotes = getTotalVotes(poll);
              const winningOption = getWinningOption(poll);

              return (
                <div
                  key={poll.id}
                  className={`bg-white rounded-2xl shadow-sm border-l-4 overflow-hidden ${
                    poll.expired ? 'border-l-gray-400' : 'border-l-green-500'
                  }`}
                >
                  <div className="p-6">
                    {/* Poll Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-2xl">
                            {poll.expired ? '⏰' : '🔴'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            poll.expired ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                          }`}>
                            {poll.expired ? '⏰ Ended' : '🔴 Active'}
                          </span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {totalVotes} votes
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {poll.question}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Expires: {new Date(poll.expiresAt?.toDate?.() ?? poll.expiresAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Results */}
                    {totalVotes > 0 ? (
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* Chart */}
                        <div className="h-64">
                          {chartType === 'bar' ? (
                            <Bar 
                              data={getChartData(poll)} 
                              options={chartOptions}
                              data-question={poll.question}
                            />
                          ) : (
                            <Doughnut 
                              data={getChartData(poll)} 
                              options={chartOptions}
                              data-question={poll.question}
                            />
                          )}
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900 mb-3">Detailed Results</h4>
                          {labels.map((option, idx) => {
                            const optionVotes = votes[option] || 0;
                            const percentage = getVotePercentage(poll, option);
                            const isWinner = poll.expired && winningOption === option;

                            return (
                              <div key={idx} className={`p-3 rounded-lg ${
                                isWinner ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                              }`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`font-medium ${
                                    isWinner ? 'text-green-900' : 'text-gray-900'
                                  }`}>
                                    {isWinner && '🏆 '}{option}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{optionVotes} votes</span>
                                    <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${
                                      isWinner ? 'bg-green-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Winner Display */}
                          {poll.expired && winningOption && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">🏆</span>
                                <div>
                                  <p className="font-semibold text-green-900">Poll Winner</p>
                                  <p className="text-green-700">{winningOption}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <span className="text-4xl text-gray-400 mb-2 block">📭</span>
                        <p className="text-gray-600">No votes yet for this poll</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}