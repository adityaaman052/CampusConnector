'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../../lib/firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      const snapshot = await getDocs(collection(db, 'polls'));
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPolls(list);
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
    });

    fetchPolls();
    return () => unsubscribe();
  }, []);

  const handleVote = async (pollId, option) => {
    const pollRef = doc(db, 'polls', pollId);
    const poll = polls.find(p => p.id === pollId);

    if (poll.voters.includes(userEmail)) {
      alert('You already voted!');
      return;
    }

    const updatedVotes = {
      ...poll.votes,
      [option]: poll.votes[option] + 1
    };

    await updateDoc(pollRef, {
      votes: updatedVotes,
      voters: [...poll.voters, userEmail]
    });

    alert('Vote submitted!');
    window.location.reload();
  };

  const isExpired = (expiresAt) => {
    const exp = expiresAt?.toDate?.() ?? new Date(expiresAt);
    return new Date() > exp;
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>📋 Active Polls</h2>
      {polls.map((poll) => (
        <div key={poll.id} style={{ marginBottom: 30, border: '1px solid #ccc', padding: 20 }}>
          <h3>{poll.question}</h3>
          <p>⏳ Expires at: {new Date(poll.expiresAt?.toDate?.() ?? poll.expiresAt).toLocaleString()}</p>
          {isExpired(poll.expiresAt) ? (
            <p>❌ Poll expired.</p>
          ) : poll.voters.includes(userEmail) ? (
            <p>✅ You already voted.</p>
          ) : (
            poll.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleVote(poll.id, opt)} style={{ marginRight: 10 }}>
                {opt}
              </button>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
