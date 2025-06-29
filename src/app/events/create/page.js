'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../../lib/firebase';
import { useRouter } from 'next/navigation';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function CreateEventPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push('/login');
      const userDoc = await getDoc(doc(db, 'users', user.email));
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        alert('Admins only');
        return router.push('/');
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    await addDoc(collection(db, 'events'), {
      title,
      description: desc,
      date: Timestamp.fromDate(new Date(date)),
      createdBy: user.email,
      attendees: []
    });
    alert('Event created!');
    router.push('/events');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>📅 Create Event</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Event Title" required value={title} onChange={e => setTitle(e.target.value)} />
        <br />
        <textarea placeholder="Event Description" required value={desc} onChange={e => setDesc(e.target.value)} />
        <br />
        <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} />
        <br />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
