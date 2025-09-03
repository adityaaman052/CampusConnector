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
  const chatEndRef = useRef(null);

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

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

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
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">CampusAI Assistant</h2>
              <p className="text-blue-100 text-sm">Your intelligent campus companion</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={clearChat}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1"
            >
              <span>🗑️</span>
              <span>Clear</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <span className="text-lg">✕</span>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6 space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🤖</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to CampusAI!</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  I'm here to help you with campus facilities, events, study tips, academic questions, and anything related to student life. How can I assist you today?
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  <button 
                    onClick={() => setInput("What events are happening this week?")}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors duration-200"
                  >
                    Campus Events
                  </button>
                  <button 
                    onClick={() => setInput("How can I improve my study habits?")}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors duration-200"
                  >
                    Study Tips
                  </button>
                  <button 
                    onClick={() => setInput("Where can I find academic resources?")}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors duration-200"
                  >
                    Resources
                  </button>
                </div>
              </div>
            ) : (
              <>
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                        : msg.type === 'error' 
                          ? 'bg-red-100 text-red-800 border border-red-200' 
                          : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {msg.type !== 'user' && (
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            msg.type === 'error' ? 'bg-red-200' : 'bg-gray-100'
                          }`}>
                            <span className="text-xs">
                              {msg.type === 'error' ? '⚠️' : '🤖'}
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border border-gray-200 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs">🤖</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          <span className="text-sm text-gray-600 ml-2">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Status Messages */}
        <div className="px-6">
          {!speechSupported && (
            <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-amber-600">⚠️</span>
                <span className="text-amber-800 text-sm">Voice input is not supported in your browser.</span>
              </div>
            </div>
          )}

          {isListening && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-800 text-sm font-medium">Listening... Speak now!</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white border-t border-gray-200 p-6">
          <div className="flex items-end space-x-3 mb-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 resize-none text-gray-900 placeholder-gray-500"
                rows={2}
                disabled={loading}
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {input.length}/500
              </div>
            </div>
            <button 
              onClick={handleAsk}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <span>Send</span>
                  <span>📤</span>
                </>
              )}
            </button>
          </div>

          {/* Voice Controls */}
          {speechSupported && (
            <div className="flex items-center justify-center space-x-3">
              <button 
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isListening 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <span>🎤</span>
                <span>{isListening ? 'Stop Listening' : 'Voice Input'}</span>
              </button>
              
              <button 
                onClick={() => setInput('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <span>🗑️</span>
                <span>Clear Input</span>
              </button>
              
              <button 
                onClick={stopSpeech}
                className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all duration-200 font-medium flex items-center space-x-2"
              >
                <span>🔇</span>
                <span>Stop Speech</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}