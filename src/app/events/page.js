'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { collection, onSnapshot, updateDoc, doc } from 'firebase/firestore';

export default function EventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'events'), (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(eventsData);
    });
    return () => unsub();
  }, []);

  const rsvp = async (eventId, attendees) => {
    const user = auth.currentUser;
    if (!user) return alert('Please log in to RSVP');
    if (attendees.includes(user.email)) return alert('Already RSVP’d');
    const ref = doc(db, 'events', eventId);
    await updateDoc(ref, {
      attendees: [...attendees, user.email]
    });
    alert('RSVP successful!');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>📅 Upcoming Events</h2>
      {events.map(event => (
        <div key={event.id} style={{ marginBottom: 20, border: '1px solid gray', padding: 10 }}>
          <h3>{event.title}</h3>
          <p>{event.description}</p>
          <p><strong>Date:</strong> {new Date(event.date.seconds * 1000).toLocaleString()}</p>
          <p><strong>Attendees:</strong> {event.attendees.length}</p>
          <button onClick={() => rsvp(event.id, event.attendees)}>RSVP</button>
        </div>
      ))}
    </div>
  );
}
