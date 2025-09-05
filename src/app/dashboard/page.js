'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic'; // 🧠 Dynamic import for modal
import {
  ScrollText, FolderOpen, MessageCircle, Users, CalendarDays,
  Vote, MessageSquareText, UserCheck, GraduationCap, ClipboardList,
  Megaphone, BookOpen, Bot, BellOff
} from "lucide-react";

import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

// 🔁 Dynamic import of modal
const AIAssistantModal = dynamic(() => import('@/components/AIAssistantModal'), { ssr: false });

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [activePolls, setActivePolls] = useState([]);
  const [showAI, setShowAI] = useState(false); // 🎯 Modal state
  const router = useRouter();

  // ✅ Auth + Fetch Polls
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push('/login');
      } else {
        setUser(u);
        const docSnap = await getDoc(doc(db, 'users', u.email));
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }

        const pollSnap = await getDocs(collection(db, 'polls'));
        const now = new Date();

        const active = pollSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => {
            const exp = p.expiresAt?.toDate?.() ?? new Date(p.expiresAt);
            return exp > now;
          })
          .map(p => {
            const exp = p.expiresAt?.toDate?.() ?? new Date(p.expiresAt);
            return {
              ...p,
              expiresAt: exp,
              timeLeft: exp.getTime() - now.getTime()
            };
          });

        setActivePolls(active);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // ⏱ Live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePolls(prevPolls =>
        prevPolls
          .map(poll => {
            const newTimeLeft = poll.expiresAt.getTime() - new Date().getTime();
            return { ...poll, timeLeft: newTimeLeft };
          })
          .filter(poll => poll.timeLeft > 0)
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔐 Logout
  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const formatTime = (ms) => {
    if (ms <= 0) return '⏳ Expired';
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  const quickLinks = [
    { href: '/feed', label: 'View Announcements', icon: ScrollText },
    { href: '/files', label: 'Upload Files', icon: FolderOpen },
    { href: '/chat', label: 'Open Chat', icon: MessageCircle },
    { href: '/users', label: 'Private Chat', icon: Users },
    { href: '/events', label: 'View Events', icon: CalendarDays },
    { href: '/polls', label: 'Participate in Polls', icon: Vote },
    { href: '/thread', label: 'Campus Threads', icon: MessageSquareText },
    { href: '/roles', label: 'Role-based Access', icon: UserCheck },
    { href: '/groups', label: 'Smart Class Groups', icon: GraduationCap },
    { href: '/attendance', label: 'Mark Attendance', icon: ClipboardList },
    { href: '/noticeboard', label: 'Noticeboard', icon: Megaphone },
    { href: '/repos', label: 'Study Repository', icon: BookOpen },
    { href: '/study-mode', label: 'Activate Study Mode', icon: BellOff },
  ];

  const adminLinks = [
    { href: '/upload', label: 'Post Announcement', icon: '📢' },
    { href: '/admin', label: 'Admin Panel', icon: '🛠' },
    { href: '/events/create', label: 'Create Event', icon: '➕' },
    { href: '/polls/create', label: 'Create Poll', icon: '🗳' },
    { href: '/polls/results', label: 'View Poll Results', icon: '📈' },
    { href: '/admin/reports', label: 'View Reports', icon: '🚨' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Campus Connect</h1>
            </div>

            {user && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{role}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user && (
          <>
            {/* Welcome Section */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                <p className="text-blue-100">
                  Ready to connect with your campus community? Explore all the features below.
                </p>
              </div>
            </div>

            {/* Active Polls Section */}
            {activePolls.length > 0 && (
              <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600">⏰</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Active Polls</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {activePolls.map(poll => (
                      <div key={poll.id} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                        <h4 className="font-medium text-gray-900 mb-2">{poll.question}</h4>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-orange-600">
                            {formatTime(poll.timeLeft)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quick Access Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Student Features */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">🎓</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Quick Access</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon; // assign the icon component
                      return (
                        <Link key={link.href} href={link.href}>
                          <div className="group p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                              <span className="font-medium text-gray-900 group-hover:text-blue-600">
                                {link.label}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}


                    {/* AI Assistant Button */}
                    <button
                      onClick={() => setShowAI(true)}
                      className="group p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 cursor-pointer text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <Bot className="w-7 h-7 text-gray-600 group-hover:text-purple-600" />
                        <span className="font-medium text-gray-900 group-hover:text-purple-600">
                          CampusAI Assistant
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Admin Panel */}
              {role === 'admin' && (
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600">👑</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Admin Panel</h3>
                    </div>

                    <div className="space-y-3">
                      {adminLinks.map((link) => (
                        <Link key={link.href} href={link.href}>
                          <div className="group p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{link.icon}</span>
                              <span className="text-sm font-medium text-gray-900 group-hover:text-red-600">
                                {link.label}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600">📊</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Polls</p>
                    <p className="text-2xl font-bold text-gray-900">{activePolls.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Role</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{role}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-purple-600">🎯</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quick Access</p>
                    <p className="text-2xl font-bold text-gray-900">{quickLinks.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600">🚀</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-lg font-bold text-green-600">Online</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 🌟 AI Assistant Modal */}
      <AIAssistantModal isOpen={showAI} onClose={() => setShowAI(false)} />

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}