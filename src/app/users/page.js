'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to load current user safely
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserEmail(user.email);

        const snapshot = await getDocs(collection(db, 'users'));
        const data = snapshot.docs.map((doc) => doc.data());

        // Filter out current user only if it's known
        const filteredUsers = data.filter(u => u.email !== user.email);
        setUsers(filteredUsers);
      }
    });

    return () => unsubscribe();
  }, []);

  const startChat = (otherEmail) => {
    const emails = [currentUserEmail, otherEmail].sort().join('_');
    router.push(`/chat/${emails}`);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>👥 Start Private Chat</h2>
      {users.length === 0 ? (
        <p>Loading users or none found...</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.email}>
              {user.email}
              <button onClick={() => startChat(user.email)} style={{ marginLeft: 10 }}>
                Chat 💬
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
