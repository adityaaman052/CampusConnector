'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!email || !password) {
        alert('Please enter both email and password');
        return;
      }

      if (isLogin) {
        // 🔐 Login
        await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      } else {
        // 📝 Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.email), {
          email: user.email,
          role: 'student',
          joinedAt: new Date().toISOString()
        });

        alert('Account created successfully!');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Auth Error:', error.message);
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>{isLogin ? 'Login' : 'Register'} to Campus Connect</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br /><br />

        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br /><br />

        <button type="submit">
          {isLogin ? 'Login' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: 20 }}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button type="button" onClick={() => setIsLogin(!isLogin)} style={{ color: 'blue' }}>
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </p>
    </div>
  );
}
