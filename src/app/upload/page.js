'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '../../../lib/firebase';
import {
  addDoc,
  collection,
  Timestamp,
  getDoc,
  doc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function UploadEventPage() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          router.push('/login');
          return;
        }

        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          alert('Access denied. Admins only.');
          router.push('/');
        } else {
          setLoading(false);
        }
      });
    };

    checkAccess();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        desc,
        createdAt: Timestamp.now()
      });
      alert('Announcement posted!');
      setTitle('');
      setDesc('');
    } catch (error) {
      console.error(error);
      alert('Error posting announcement');
    }
  };

  if (loading) return <p>Checking permissions...</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>📢 Post Announcement (Admin Only)</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br />
        <textarea
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          required
        />
        <br />
        <button type="submit">Post</button>
      </form>
    </div>
  );
}
