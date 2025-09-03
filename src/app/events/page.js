'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/login');
      }
    });

    const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching events:', error);
      setIsLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsub();
    };
  }, [router]);

  const rsvp = async (eventId, attendees) => {
    if (!user) return alert('Please log in to RSVP');
    if (attendees.includes(user.email)) return alert('Already RSVP\'d');
    
    try {
      const ref = doc(db, 'events', eventId);
      await updateDoc(ref, {
        attendees: [...attendees, user.email]
      });
      alert('RSVP successful!');
    } catch (error) {
      console.error('Error updating RSVP:', error);
      alert('Failed to RSVP. Please try again.');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Date TBD';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (timestamp) => {
    if (!timestamp) return 'tbd';
    const eventDate = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
    const now = new Date();
    const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'past';
    if (diffDays === 0) return 'today';
    if (diffDays <= 7) return 'this-week';
    return 'upcoming';
  };

  const getEventIcon = (title = '', description = '') => {
    const content = (title + ' ' + description).toLowerCase();
    if (content.includes('workshop') || content.includes('seminar')) return '🎓';
    if (content.includes('sports') || content.includes('game')) return '⚽';
    if (content.includes('meeting') || content.includes('conference')) return '👥';
    if (content.includes('party') || content.includes('celebration')) return '🎉';
    if (content.includes('competition') || content.includes('contest')) return '🏆';
    if (content.includes('exhibition') || content.includes('show')) return '🎨';
    if (content.includes('concert') || content.includes('music')) return '🎵';
    return '📅';
  };

  const filteredEvents = events.filter(event => {
    const status = getEventStatus(event.date);
    if (filter === 'upcoming') return ['upcoming', 'this-week', 'today'].includes(status);
    if (filter === 'past') return status === 'past';
    if (filter === 'my-rsvps') return event.attendees?.includes(user?.email);
    return true;
  });

  const sortedEvents = filteredEvents.sort((a, b) => {
    if (!a.date || !b.date) return 0;
    const dateA = a.date.seconds ? new Date(a.date.seconds * 1000) : new Date(a.date);
    const dateB = b.date.seconds ? new Date(b.date.seconds * 1000) : new Date(b.date);
    return dateA - dateB;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
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
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">📅</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Events</h1>
                <p className="text-sm text-gray-500">Discover and join exciting campus activities</p>
              </div>
            </div>
            
            <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-lg">
              {sortedEvents.length} events
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
            {[
              { key: 'upcoming', label: 'Upcoming', count: events.filter(e => ['upcoming', 'this-week', 'today'].includes(getEventStatus(e.date))).length },
              { key: 'my-rsvps', label: 'My RSVPs', count: events.filter(e => e.attendees?.includes(user?.email)).length },
              { key: 'past', label: 'Past Events', count: events.filter(e => getEventStatus(e.date) === 'past').length },
              { key: 'all', label: 'All Events', count: events.length }
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
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">📅</span>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {filter === 'upcoming' ? 'No upcoming events' : 
               filter === 'my-rsvps' ? 'No RSVPs yet' :
               filter === 'past' ? 'No past events' : 'No events found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'upcoming' ? 'Check back later for new events and activities.' :
               filter === 'my-rsvps' ? 'RSVP to events to see them here.' :
               'Try switching to a different filter.'}
            </p>
            {filter !== 'upcoming' && (
              <button
                onClick={() => setFilter('upcoming')}
                className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
              >
                View upcoming events
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map(event => {
              const status = getEventStatus(event.date);
              const isRSVPed = event.attendees?.includes(user?.email);
              
              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 ${
                    status === 'today' ? 'border-green-300 ring-2 ring-green-100' :
                    status === 'this-week' ? 'border-blue-300' :
                    status === 'past' ? 'border-gray-200 opacity-75' :
                    'border-gray-200'
                  }`}
                >
                  {/* Event Header */}
                  <div className={`p-4 ${
                    status === 'today' ? 'bg-gradient-to-r from-green-50 to-emerald-50' :
                    status === 'this-week' ? 'bg-gradient-to-r from-blue-50 to-indigo-50' :
                    status === 'past' ? 'bg-gray-50' :
                    'bg-gradient-to-r from-purple-50 to-pink-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getEventIcon(event.title, event.description)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === 'today' ? 'bg-green-100 text-green-700' :
                          status === 'this-week' ? 'bg-blue-100 text-blue-700' :
                          status === 'past' ? 'bg-gray-100 text-gray-600' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {status === 'today' ? '🔥 Today' :
                           status === 'this-week' ? '⚡ This Week' :
                           status === 'past' ? '✅ Past' :
                           '📅 Upcoming'}
                        </span>
                      </div>
                      {isRSVPed && (
                        <span className="text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                      {event.title}
                    </h3>
                  </div>

                  {/* Event Content */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{formatTime(event.date)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{event.attendees?.length || 0} attendees</span>
                      </div>
                    </div>

                    {/* RSVP Button */}
                    <button
                      onClick={() => rsvp(event.id, event.attendees || [])}
                      disabled={isRSVPed || status === 'past'}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none ${
                        isRSVPed 
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : status === 'past'
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                      }`}
                    >
                      {isRSVPed ? '✅ Already RSVP\'d' : 
                       status === 'past' ? '⏰ Event Ended' : 
                       '🎟️ RSVP Now'}
                    </button>
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600">📅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600">⚡</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => ['upcoming', 'this-week', 'today'].includes(getEventStatus(e.date))).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600">🎟️</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">My RSVPs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.filter(e => e.attendees?.includes(user?.email)).length}
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
                <p className="text-sm text-gray-600">Total Attendees</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.reduce((sum, event) => sum + (event.attendees?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}