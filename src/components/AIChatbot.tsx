import { useState } from 'react';

export const AIChatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ sender: 'ai', text: "Salom! Men Torabekning AI yordamchisiman." }]);
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { sender: 'user', text: input }]);
    const currentInput = input;
    setInput('');

    try {
      const res = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Xatolik yuz berdi. Backend ulanmagan." }]);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', 
          backgroundColor: '#00ff88', color: 'black', 
          fontWeight: 'bold', padding: '16px', 
          borderRadius: '50px', border: 'none', 
          cursor: 'pointer', zIndex: 9999, boxShadow: '0 4px 15px rgba(0,255,136,0.3)'
        }}
      >
        💬 AI Chat
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', width: '320px', height: '400px',
      backgroundColor: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)',
      borderRadius: '15px', border: '1px solid #00ff88', zIndex: 9999,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: 'white', fontFamily: 'sans-serif'
    }}>
      <div style={{
        backgroundColor: '#00ff88', padding: '12px', color: 'black', fontWeight: 'bold', 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span>AI Assistant</span>
        <button onClick={() => setIsOpen(false)} style={{
          background: 'none', border: 'none', color: 'black', cursor: 'pointer', fontWeight: 'bold'
        }}>✕</button>
      </div>
      <div style={{
        flex: 1, padding: '12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px'
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            padding: '8px 12px', borderRadius: '10px', maxWidth: '80%', fontSize: '14px',
            alignSelf: m.sender === 'ai' ? 'flex-start' : 'flex-end',
            backgroundColor: m.sender === 'ai' ? '#1f2937' : '#00ff88',
            color: m.sender === 'ai' ? '#00ff88' : 'black'
          }}>
            {m.text}
          </div>
        ))}
      </div>
      <div style={{
        padding: '10px', borderTop: '1px solid #374151', display: 'flex', backgroundColor: '#111827'
      }}>
        <input 
          type="text" 
          value={input} 
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          style={{
            flex: 1, backgroundColor: '#1f2937', color: 'white', padding: '8px 12px',
            border: 'none', borderRadius: '8px 0 0 8px', outline: 'none'
          }}
          placeholder="Savol bering..."
        />
        <button onClick={sendMessage} style={{
          backgroundColor: '#00ff88', color: 'black', padding: '8px 16px', border: 'none',
          borderRadius: '0 8px 8px 0', fontWeight: 'bold', cursor: 'pointer'
        }}>Yuborish</button>
      </div>
    </div>
  );
};
