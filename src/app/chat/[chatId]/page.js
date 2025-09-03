'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

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
        setConnectionStatus('connected');
      },
      (error) => {
        console.error("❌ Error listening to messages:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setConnectionStatus('error');
      }
    );

    return () => unsubscribe();
  }, [chatId, user]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (sender) => sender === user?.email;

  const getChatPartnerName = () => {
    if (!chatId || !user?.email) return 'Unknown';
    const parts = chatId.split('_');
    const partner = parts.find(part => part !== user.email);
    return partner ? partner.split('@')[0] : 'Unknown';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access this private chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Private Chat with {getChatPartnerName()}
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
                    connectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className="capitalize">{connectionStatus}</span>
                </div>
              </div>
            </div>
            
            {/* Debug Toggle Button */}
            <button
              onClick={() => {
                const debugDiv = document.getElementById('debug-info');
                debugDiv.style.display = debugDiv.style.display === 'none' ? 'block' : 'none';
              }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors duration-200"
            >
              Debug Info
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Debug Info Panel */}
        <div 
          id="debug-info"
          className="mb-6 bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono"
          style={{ display: 'none' }}
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-400">🐛</span>
            <span className="text-white font-semibold">Debug Information</span>
          </div>
          <div className="space-y-1">
            <div><span className="text-blue-400">Chat ID:</span> {chatId}</div>
            <div><span className="text-blue-400">User Email:</span> {user?.email}</div>
            <div><span className="text-blue-400">Collection Path:</span> privateChats/{chatId}/messages</div>
            <div><span className="text-blue-400">Messages Count:</span> {messages.length}</div>
            <div><span className="text-blue-400">Connection:</span> {connectionStatus}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Messages Container */}
          <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <div className="text-lg font-medium">Private conversation</div>
                <div className="text-sm text-center">
                  This is a secure private chat with {getChatPartnerName()}.<br/>
                  Send the first message to start the conversation!
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${isMyMessage(msg.sender) ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    isMyMessage(msg.sender)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    {!isMyMessage(msg.sender) && (
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {msg.sender.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {msg.sender.split('@')[0]}
                        </span>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed">{msg.text}</div>
                    <div className={`text-xs mt-1 ${
                      isMyMessage(msg.sender) ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white border-t border-gray-200 text-black">
            <form onSubmit={sendMessage} className="flex space-x-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={`Send a private message to ${getChatPartnerName()}...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={isLoading || connectionStatus === 'error'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 pr-16 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                  {message.length}/500
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!message.trim() || isLoading || connectionStatus === 'error'}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Send</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                )}
              </button>
            </form>
            
            {/* Chat Info */}
            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>🔒 End-to-end encrypted</span>
                <span>•</span>
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' : 
                  connectionStatus === 'error' ? 'bg-red-400' : 'bg-yellow-400'
                }`}></div>
                <span className="capitalize">{connectionStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 bg-purple-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600">🔐</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-purple-900 mb-1">Private Chat</h3>
              <p className="text-sm text-purple-700">
                This is a private conversation between you and {getChatPartnerName()}. 
                Messages are stored securely and only visible to participants in this chat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}