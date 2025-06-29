'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [activePolls, setActivePolls] = useState([]);
  const router = useRouter();

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
  }, []);

  // Live countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setActivePolls((prevPolls) =>
        prevPolls
          .map((poll) => {
            const newTimeLeft = poll.expiresAt.getTime() - new Date().getTime();
            return { ...poll, timeLeft: newTimeLeft };
          })
          .filter((poll) => poll.timeLeft > 0) // Remove expired polls
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <div style={{ padding: 40 }}>
      <h1>🎓 Campus Connect Dashboard</h1>

      {user && (
        <div>
          <p>👤 Logged in as: {user.email}</p>
          <p>🛡️ Role: {role}</p>
          <button onClick={handleLogout}>Logout</button>

          <hr />

          <h2>🔗 Quick Links</h2>
          <ul>
            <li><a href="/feed">📜 View Announcements</a></li>
            <li><a href="/files">📁 Upload Files</a></li>
            <li><a href="/chat">💬 Open Chat</a></li>
            <li><a href="/users">💬 Private Chat</a></li>
            <li><a href="/events">📅 View Events</a></li>
            <li><a href="/polls">🗳 Participate in Polls</a></li>
            <li><a href="/thread">🧵 Campus Threads</a></li>

            {role === 'admin' && (
              <>
                <li><a href="/upload">📢 Post Announcement</a></li>
                <li><a href="/admin">🛠 Admin Panel</a></li>
                <li><a href="/events/create">➕ Create Event</a></li>
                <li><a href="/polls/create">🗳 Create Poll</a></li>
                <li><a href="/polls/results">📈 View Poll Results</a></li>
                <li><a href="/admin/reports">🚨 View Reports</a></li>


              </>
            )}
          </ul>

          {activePolls.length > 0 && (
            <>
              <hr />
              <h2>🕒 Active Polls (Live Countdown)</h2>
              <ul>
                {activePolls.map((poll) => (
                  <li key={poll.id}>
                    <strong>{poll.question}</strong> <br />
                    ⏳ Time left: {formatTime(poll.timeLeft)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
