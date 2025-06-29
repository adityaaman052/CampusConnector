'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, getDocs, getDoc, doc as docRef } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function PollResultsPage() {
  const [polls, setPolls] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      const snapshot = await getDocs(collection(db, 'polls'));
      const now = new Date();

      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        expired: now > (doc.data().expiresAt?.toDate?.() ?? new Date(doc.data().expiresAt)),
      }));

      setPolls(list);
    };

    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const userDoc = await getDoc(docRef(db, 'users', user.email));
      if (userDoc?.data()?.role === 'admin') {
        setRole('admin');
        fetchPolls();
      }
    });

    return () => unsubscribe();
  }, []);

  if (role !== 'admin') {
    return <p style={{ padding: 40 }}>❌ Only admins can view poll results.</p>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>📊 Poll Results</h2>
      {polls.length === 0 && <p>No polls available.</p>}
      {polls.map((poll) => {
        const votes = poll.votes || {};
        const labels = Object.keys(votes);
        const values = Object.values(votes);

        // Determine winner if poll is expired
        let winningOption = null;
        if (poll.expired && labels.length > 0) {
          const maxVotes = Math.max(...values);
          const winners = labels.filter(label => votes[label] === maxVotes);
          winningOption = winners.length === 1 ? winners[0] : `Tie between: ${winners.join(', ')}`;
        }

        return (
          <div key={poll.id} style={{ marginBottom: 40 }}>
            <h3>{poll.question}</h3>
            {poll.expiresAt && (
              <p>
                ⏳ Ends on:{' '}
                {new Date(poll.expiresAt?.toDate?.() ?? poll.expiresAt).toLocaleString()}
              </p>
            )}

            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: 'Votes',
                    data: values,
                    backgroundColor: 'rgba(75,192,192,0.6)',
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />

            {poll.expired && winningOption && (
              <p style={{ marginTop: 10, fontWeight: 'bold', color: 'green' }}>
                ✅ <u>Winner:</u> {winningOption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
