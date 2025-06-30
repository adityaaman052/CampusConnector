'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function AIAssistantModal({ isOpen, onClose }) {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  
  const recognitionRef = useRef(null);
  const speechSynthRef = useRef(null);

  useEffect(() => {
    // Check for speech recognition support
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      setSpeechSupported(!!SpeechRecognition);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = () => {
          setIsListening(false);
        };
      }
      
      // Check for speech synthesis support
      speechSynthRef.current = window.speechSynthesis;
    }
  }, []);

  const handleAsk = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userMessage = input.trim();
    
    // Add user message to chat history
    setChatHistory(prev => [...prev, { type: 'user', content: userMessage }]);
    setInput('');
    
    try {
      const res = await axios.post('/api/ai', { message: userMessage });
      const aiResponse = res.data.reply;
      
      setResponse(aiResponse);
      setChatHistory(prev => [...prev, { type: 'ai', content: aiResponse }]);
      
      // Speak the response using Web Speech API
      if (speechSynthRef.current) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthRef.current.speak(utterance);
      }
    } catch (err) {
      const errorMessage = '❌ Error: Could not get answer. Please try again.';
      setResponse(errorMessage);
      setChatHistory(prev => [...prev, { type: 'error', content: errorMessage }]);
    }
    
    setLoading(false);
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const stopSpeech = () => {
    if (speechSynthRef.current) {
      speechSynthRef.current.cancel();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResponse('');
    stopSpeech();
    setInput('');
  };

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100%', 
      height: '100%', 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      zIndex: 1000 
    }}>
      <div style={{ 
        background: 'white', 
        padding: '30px', 
        borderRadius: '12px', 
        width: '600px', 
        maxWidth: '90%', 
        maxHeight: '80%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px',
          borderBottom: '1px solid #eee',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>🤖 CampusAI Assistant</h2>
          <div>
            <button 
              onClick={clearChat}
              style={{
                padding: '8px 12px',
                marginRight: '10px',
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Clear Chat
            </button>
            <button 
              onClick={onClose}
              style={{
                padding: '8px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          marginBottom: '20px',
          border: '1px solid #eee',
          borderRadius: '8px',
          padding: '15px',
          backgroundColor: '#f9f9f9',
          minHeight: '200px',
          maxHeight: '300px'
        }}>
          {chatHistory.length === 0 ? (
            <p style={{ color: '#666', textAlign: 'center', margin: 0 }}>
              👋 Hi! I'm CampusAI. Ask me about campus facilities, events, study tips, or anything related to student life!
            </p>
          ) : (
            chatHistory.map((msg, index) => (
              <div key={index} style={{ 
                marginBottom: '15px',
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: msg.type === 'user' ? '#007bff' : msg.type === 'error' ? '#dc3545' : '#28a745',
                color: 'white'
              }}>
                <strong>{msg.type === 'user' ? 'You' : msg.type === 'error' ? 'Error' : 'CampusAI'}:</strong>
                <div style={{ marginTop: '5px' }}>{msg.content}</div>
              </div>
            ))
          )}
          {loading && (
            <div style={{ 
              textAlign: 'center', 
              color: '#666',
              padding: '10px'
            }}>
              🤔 Thinking...
            </div>
          )}
        </div>

        {/* Voice Input Status */}
        {!speechSupported && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            color: '#856404',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #ffeaa7'
          }}>
            ⚠️ Your browser doesn't support voice input.
          </div>
        )}

        {isListening && (
          <div style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724',
            padding: '10px',
            borderRadius: '6px',
            marginBottom: '15px',
            border: '1px solid #c3e6cb'
          }}>
            🎤 Listening... Speak now!
          </div>
        )}

        {/* Input Section */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask your question..."
            style={{ 
              flex: 1,
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              color:'black'
            }}
            disabled={loading}
          />
          <button 
            onClick={handleAsk}
            disabled={loading || !input.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              minWidth: '80px'
            }}
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {/* Voice Controls */}
        {speechSupported && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={isListening ? stopListening : startListening}
              style={{
                padding: '10px 15px',
                backgroundColor: isListening ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🎤 {isListening ? 'Stop Listening' : 'Voice Input'}
            </button>
            <button 
              onClick={() => setInput('')}
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ♻️ Clear Input
            </button>
            <button 
              onClick={stopSpeech}
              style={{
                padding: '10px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔇 Stop Speech
            </button>
          </div>
        )}
      </div>
    </div>
  );
}