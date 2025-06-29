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
    // register the listener once; include `router` so ESLint is happy
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        router.push('/login');
        return;
      }

      const docSnap = await getDoc(doc(db, 'users', u.email));
      const isUserAdmin = docSnap.exists() && docSnap.data().role === 'admin';

      if (isUserAdmin) {
        setUser(u);
        setIsAdmin(true);
      } else {
        alert('You are not an admin!');
        router.push('/dashboard');
      }
    });

    // return the unsubscribe function for cleanup
    return unsubscribe;
  }, [router]); // ✅ include router to satisfy the React‑Hooks ESLint rule

  return (
    <div style={{ padding: 40 }}>
      {isAdmin
        ? <h2>🛠 Welcome Admin {user?.email}</h2>
        : <p>Checking access...</p>
      }
    </div>
  );
}
