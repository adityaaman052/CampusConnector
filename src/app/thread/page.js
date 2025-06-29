// ✅ File: app/threads/page.js

'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '../../../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDocs
} from 'firebase/firestore';

export default function CampusThreadsPage() {
  const [threads, setThreads] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tag, setTag] = useState('General');
  const [userEmail, setUserEmail] = useState('');
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [visibleComments, setVisibleComments] = useState({});
  const [newComments, setNewComments] = useState({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async user => {
      if (user) {
        setUserEmail(user.email);

        const q = query(collection(db, 'threads'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, async snapshot => {
          const items = await Promise.all(
            snapshot.docs.map(async docSnap => {
              const data = docSnap.data();
              const id = docSnap.id;
              return { id, ...data };
            })
          );
          setThreads(items);
        });

        return () => unsubscribe();
      }
    });

    return () => unsub();
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    await addDoc(collection(db, 'threads'), {
      title,
      content,
      tag,
      createdBy: userEmail,
      upvotes: [],
      bookmarks: [],
      timestamp: serverTimestamp()
    });

    setTitle('');
    setContent('');
  };

  const handleUpvote = async (threadId) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      upvotes: arrayUnion(userEmail)
    });
  };

  const handleBookmark = async (threadId, isBookmarked) => {
    const threadRef = doc(db, 'threads', threadId);
    await updateDoc(threadRef, {
      bookmarks: isBookmarked ? arrayRemove(userEmail) : arrayUnion(userEmail)
    });
  };

  const toggleComments = async (threadId) => {
    if (visibleComments[threadId]) {
      setVisibleComments(prev => ({ ...prev, [threadId]: null }));
    } else {
      const commentsSnapshot = await getDocs(collection(db, `threads/${threadId}/comments`));
      const comments = commentsSnapshot.docs.map(doc => doc.data());
      setVisibleComments(prev => ({ ...prev, [threadId]: comments }));
    }
  };

  const handleAddComment = async (threadId) => {
    const commentText = newComments[threadId]?.trim();
    if (!commentText) return;

    await addDoc(collection(db, `threads/${threadId}/comments`), {
      text: commentText,
      author: userEmail,
      timestamp: serverTimestamp()
    });

    setNewComments(prev => ({ ...prev, [threadId]: '' }));
    toggleComments(threadId); // refresh comments
  };

  const bookmarkedThreads = threads.filter(t => t.bookmarks?.includes(userEmail));

  return (
    <div style={{ padding: 40 }}>
      <h2>🧵 Campus Threads</h2>

      <form onSubmit={handlePost} style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="Thread Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={4}
          style={{ width: '100%', marginBottom: 10 }}
        />
        <select value={tag} onChange={e => setTag(e.target.value)}>
          <option>General</option>
          <option>Hostel</option>
          <option>Academics</option>
          <option>Internships</option>
          <option>Complaints</option>
        </select>
        <button type="submit" style={{ marginLeft: 10 }}>Post</button>
      </form>

      <button onClick={() => setShowBookmarks(!showBookmarks)} style={{ marginBottom: 20 }}>
        {showBookmarks ? '🔓 Hide Bookmarks' : '🔖 Show Bookmarked Threads'}
      </button>

      {showBookmarks && (
        <div>
          <h3>🔖 Bookmarked Threads</h3>
          {bookmarkedThreads.map(thread => (
            <div key={thread.id} style={{ border: '1px solid green', padding: 15, marginBottom: 20 }}>
              <h3>{thread.title}</h3>
              <p>{thread.content}</p>
              <small>📌 {thread.tag} | ✍️ {thread.createdBy}</small>
              <br />
              <p>👍 {thread.upvotes?.length || 0} Upvotes</p>
              <button onClick={() => handleBookmark(thread.id, true)}>
                ❌ Unbookmark
              </button>
            </div>
          ))}
        </div>
      )}

      <h3>🧾 All Threads</h3>
      {threads.map(thread => (
        <div key={thread.id} style={{ border: '1px solid #ccc', padding: 15, marginBottom: 20 }}>
          <h3>{thread.title}</h3>
          <p>{thread.content}</p>
          <small>📌 {thread.tag} | ✍️ {thread.createdBy}</small>
          <br />
          <button onClick={() => handleUpvote(thread.id)}>
            👍 {thread.upvotes?.length || 0} Upvotes
          </button>
          <button
            onClick={() => handleBookmark(thread.id, thread.bookmarks?.includes(userEmail))}
            style={{ marginLeft: 10 }}
          >
            {thread.bookmarks?.includes(userEmail) ? '❌ Unbookmark' : '🔖 Bookmark'}
          </button>
          <button onClick={() => toggleComments(thread.id)} style={{ marginLeft: 10 }}>
            💬 {visibleComments[thread.id] ? 'Hide Comments' : 'Show Comments'}
          </button>

          {visibleComments[thread.id] && (
            <div style={{ marginTop: 10 }}>
              {visibleComments[thread.id].length === 0 ? (
                <p>No comments yet.</p>
              ) : (
                visibleComments[thread.id].map((comment, i) => (
                  <p key={i}>💬 {comment.text} — <i>{comment.author}</i></p>
                ))
              )}
              <div style={{ marginTop: 10 }}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComments[thread.id] || ''}
                  onChange={e =>
                    setNewComments(prev => ({ ...prev, [thread.id]: e.target.value }))
                  }
                  style={{ width: '70%' }}
                />
                <button onClick={() => handleAddComment(thread.id)} style={{ marginLeft: 10 }}>
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
