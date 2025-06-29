'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { auth, db } from '../../../../lib/firebase';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';

export default function PrivateChatPage() {
  const { chatId } = useParams();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log("=== DEBUG INFO ===");
    console.log("Chat ID:", chatId);
    console.log("Chat ID type:", typeof chatId);
    console.log("Current user:", user?.email);
    console.log("User UID:", user?.uid);
    
    // Debug: Check if chatId contains the user's email
    if (chatId) {
      const chatParts = chatId.split('_');
      console.log("Chat parts:", chatParts);
      console.log("Does chatId contain user email?", 
        chatParts.includes(user?.email) || 
        chatId.includes(user?.email)
      );
    }
    
    console.log("Collection path:", `privateChats/${chatId}/messages`);
    console.log("==================");

    const q = query(
      collection(db, `privateChats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        console.log("✅ Successfully received messages:", snapshot.docs.length);
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(msgs);
      },
      (error) => {
        console.error("❌ Error listening to messages:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    console.log("=== SENDING MESSAGE ===");
    console.log("Collection path:", `privateChats/${chatId}/messages`);
    console.log("Message data:", {
      text: message,
      sender: user.email,
      timestamp: "serverTimestamp()"
    });

    try {
      await addDoc(collection(db, `privateChats/${chatId}/messages`), {
        text: message,
        sender: user.email,
        timestamp: serverTimestamp(),
      });

      console.log("✅ Message sent successfully");
      setMessage('');
    } catch (error) {
      console.error("❌ Error sending message:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
    }
  };

  if (!user) {
    return <div style={{ padding: 40 }}>Please sign in to access this chat.</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>🗨️ Private Chat: {chatId?.replace('_', ' ⇄ ')}</h2>
      
      {/* Debug Info Display */}
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: 10, 
        marginBottom: 20, 
        fontSize: '12px',
        border: '1px solid #ccc'
      }}>
        <strong>Debug Info:</strong><br/>
        Chat ID: {chatId}<br/>
        User Email: {user?.email}<br/>
        Collection Path: privateChats/{chatId}/messages
      </div>
      
      <div style={{ maxHeight: 400, overflowY: 'auto', border: '1px solid #ccc', padding: 10 }}>
        {messages.length === 0 ? (
          <p style={{ color: '#666' }}>No messages yet...</p>
        ) : (
          messages.map((msg) => (
            <p key={msg.id}>
              <strong>{msg.sender}: </strong>{msg.text}
            </p>
          ))
        )}
      </div>

      <form onSubmit={sendMessage} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: '70%' }}
        />
        <button type="submit" style={{ marginLeft: 10 }}>Send</button>
      </form>
    </div>
  );
}