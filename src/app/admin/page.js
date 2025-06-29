'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push('/login');
      } else {
        const docSnap = await getDoc(doc(db, 'users', u.email));
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setUser(u);
          setIsAdmin(true);
        } else {
          alert('You are not an admin!');
          router.push('/dashboard');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      {isAdmin ? <h2>🛠 Welcome Admin {user?.email}</h2> : <p>Checking access...</p>}
    </div>
  );
}
