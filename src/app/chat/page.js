'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export default function ChatPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    await addDoc(collection(db, 'messages'), {
      text: message,
      sender: user?.email || 'Anonymous',
      timestamp: serverTimestamp(),
    });

    setMessage('');
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>💬 Campus Chat Room</h2>
      <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((msg) => (
          <p key={msg.id}>
            <strong>{msg.sender}: </strong>{msg.text}
          </p>
        ))}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '70%' }}
        />
        <button type="submit" style={{ marginLeft: 10 }}>
          Send
        </button>
      </form>
    </div>
  );
}
