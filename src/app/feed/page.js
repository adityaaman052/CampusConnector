'use client';

import { useEffect, useState } from 'react';
import { db } from '../../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function FeedPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>📰 Campus Announcements Feed</h2>
      {events.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} style={{ marginBottom: 20, padding: 10, border: '1px solid #ccc' }}>
            <h3>{event.title}</h3>
            <p>{event.desc}</p>
            <small>{new Date(event.createdAt.seconds * 1000).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}
