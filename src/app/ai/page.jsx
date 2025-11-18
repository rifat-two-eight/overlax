"use client";

import { useState, useRef, useEffect } from 'react';

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const eventSourceRef = useRef(null);

  const sendMessage = () => {
    if (!message.trim() || isTyping) return;

    const userMsg = message;
    setChats(prev => [...prev, { text: userMsg, sender: 'user' }]);
    setMessage('');
    setIsTyping(true);

    // Add empty AI message
    setChats(prev => [...prev, { text: '', sender: 'ai', id: Date.now() }]);

    // Streaming connection
    eventSourceRef.current = new EventSource(`http://localhost:5000/api/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message: userMsg, uid: 'user123' }),
      headers: { 'Content-Type': 'application/json' }
    });

    let fullReply = '';
    eventSourceRef.current.onmessage = (e) => {
      if (e.data === '[END]') {
        eventSourceRef.current.close();
        setIsTyping(false);
        return;
      }
      fullReply += e.data;
      setChats(prev => prev.map(chat =>
        chat.id === Date.now() ? { ...chat, text: fullReply } : chat
      ));
    };
  };

  // Cleanup
  useEffect(() => {
    return () => eventSourceRef.current?.close();
  }, []);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 right-8 btn btn-circle btn-primary shadow-2xl text-3xl z-50 hover:scale-110 transition"
      >
        AI
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-8 w-96 h-[600px] bg-base-100 shadow-2xl rounded-2xl border flex flex-col z-50">
          <div className="bg-primary text-white p-4 rounded-t-2xl font-bold flex justify-between items-center">
            <span>Overlax AI</span>
            <button onClick={() => setOpen(false)} className="btn btn-sm btn-circle btn-ghost">×</button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="chat chat-start">
              <div className="chat-bubble chat-bubble-accent">Salam! Ami tumar AI Assistant</div>
            </div>

            {chats.map((chat, i) => (
              <div key={i} className={`chat ${chat.sender === 'user' ? 'chat-end' : 'chat-event'}`}>
                <div className={`chat-bubble ${chat.sender === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'} whitespace-pre-wrap`}>
                  {chat.text || '...'}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-accent">
                  <span className="loading loading-dots loading-sm"></span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message bolo..."
              className="input input-bordered flex-1"
              disabled={isTyping}
            />
            <button onClick={sendMessage} className="btn btn-primary" disabled={isTyping}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}