'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';                      // ⬅️ NEW
import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [activePolls, setActivePolls] = useState([]);
  const router = useRouter();

  /* ───────────────────────────────────────────── */
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
              timeLeft: exp.getTime() - now.getTime(),
            };
          });

        setActivePolls(active);
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);   /* include `router` to silence the ESLint warning */

  /* ───────────────────────────────────────────── */
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

  /* ───────────────────────────────────────────── */
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

  /* ───────────────────────────────────────────── */
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
            <li><Link href="/feed">📜 View Announcements</Link></li>
            <li><Link href="/files">📁 Upload Files</Link></li>
            <li><Link href="/chat">💬 Open Chat</Link></li>
            <li><Link href="/users">💬 Private Chat</Link></li>
            <li><Link href="/events">📅 View Events</Link></li>
            <li><Link href="/polls">🗳 Participate in Polls</Link></li>
            <li><Link href="/thread">🧵 Campus Threads</Link></li>

            {role === 'admin' && (
              <>
                <li><Link href="/upload">📢 Post Announcement</Link></li>
                <li><Link href="/admin">🛠 Admin Panel</Link></li>
                <li><Link href="/events/create">➕ Create Event</Link></li>
                <li><Link href="/polls/create">🗳 Create Poll</Link></li>
                <li><Link href="/polls/results">📈 View Poll Results</Link></li>
                <li><Link href="/admin/reports">🚨 View Reports</Link></li>
              </>
            )}
          </ul>

          {activePolls.length > 0 && (
            <>
              <hr />
              <h2>🕒 Active Polls (Live Countdown)</h2>
              <ul>
                {activePolls.map(poll => (
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
