'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function CreatePollPage() {
  const [question, setQuestion] = useState('');
  const [options, setOptions]  = useState('');
  const [expiry,  setExpiry]   = useState('');
  const [role,    setRole]     = useState('');
  const [checking, setChecking] = useState(true);      // ⬅️ show “Loading…” while we check
  const router = useRouter();

  /* ───────────────────────────────────────────── */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.email));
      const userRole = userDoc.exists() ? userDoc.data().role : '';
      setRole(userRole);
      setChecking(false);

      if (userRole !== 'admin') {
        alert('Only admins can create polls');
        router.push('/');
      }
    });

    return unsubscribe;   // proper cleanup
  }, [router]);           // ✅ include router to satisfy ESLint

  /* ───────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    const cleanOptions = options.split(',').map(opt => opt.trim());
    const votes = Object.fromEntries(cleanOptions.map(opt => [opt, 0]));

    await addDoc(collection(db, 'polls'), {
      question,
      options: cleanOptions,
      votes,
      createdBy: user.email,
      createdAt: serverTimestamp(),
      expiresAt: new Date(expiry),
      voters: [],
    });

    alert('Poll created!');
    router.push('/dashboard');
  };

  /* ───────────────────────────────────────────── */
  if (checking) return <p style={{ padding: 40 }}>Loading…</p>;
  if (role !== 'admin') return <p style={{ padding: 40 }}>❌ Only admins can create polls.</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>🗳️ Create New Poll</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Poll Question"
          required
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <br />

        <input
          type="text"
          placeholder="Options (comma separated)"
          required
          value={options}
          onChange={(e) => setOptions(e.target.value)}
        />
        <br />

        <input
          type="datetime-local"
          required
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
        />
        <br />

        <button type="submit">Create Poll</button>
      </form>
    </div>
  );
}
