'use client';

import { useEffect, useState } from 'react';
import { db, auth } from '../../../../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setRole('admin');

          const snapshot = await getDocs(collection(db, 'reports'));
          const list = snapshot.docs.map(doc => doc.data());
          setReports(list);
        }
      }
    });
  }, []);

  if (role !== 'admin') return <p style={{ padding: 40 }}>❌ Access Denied</p>;

  return (
    <div style={{ padding: 40 }}>
      <h2>🚨 Reported Threads</h2>
      {reports.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        reports.map((report, i) => (
          <div key={i} style={{ border: '1px solid red', padding: 15, marginBottom: 20 }}>
            <p><strong>🧵 Thread ID:</strong> {report.threadId}</p>
            <p><strong>📣 Reported By:</strong> {report.reportedBy}</p>
            <p><strong>🕒 At:</strong> {new Date(report.timestamp?.toDate()).toLocaleString()}</p>
            <p><strong>📄 Reason:</strong> {report.reason}</p>
            <a href={`/threads#${report.threadId}`}>🔍 View Thread</a>
          </div>
        ))
      )}
    </div>
  );
}
