import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DemoModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Bonjour ! Bienvenue chez AfriStyle. Je suis l'assistant IA de la boutique. Comment puis-je vous aider aujourd'hui ? Nous avons de magnifiques pièces en wax et boubou premium.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await axios.post(`${API_URL}/api/demo/chat`, {
        message: text,
        session_id: sessionId,
        conversation_history: history,
      });

      setSessionId(res.data.session_id);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Désolé, je rencontre un problème technique. Réessayez dans un instant.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid="demo-modal">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0B141A] rounded-2xl overflow-hidden shadow-2xl border border-border flex flex-col" style={{ height: '600px' }}>
        {/* WhatsApp-style Header */}
        <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between border-b border-[#2A3942]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">WAZA Bot</div>
              <div className="text-xs text-[#8696A0]">
                {loading ? 'en train d\'écrire...' : 'Agent IA AfriStyle'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition"
            data-testid="demo-modal-close"
          >
            <X className="w-5 h-5 text-[#8696A0]" />
          </button>
        </div>

        {/* Chat background pattern */}
        <div
          className="flex-1 overflow-y-auto px-3 py-4 space-y-2"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* Demo banner */}
          <div className="mx-auto mb-3 bg-[#1D2E35] rounded-lg px-3 py-2 text-center">
            <span className="text-xs text-[#8696A0]">
              Démo interactive — Simulez une conversation WhatsApp avec un agent IA WAZA
            </span>
          </div>

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#005C4B] text-white rounded-tr-sm'
                    : 'bg-[#1F2C34] text-[#E9EDEF] rounded-tl-sm'
                }`}
                data-testid={`demo-message-${msg.role}-${i}`}
              >
                {msg.content}
                <div className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-[#8696A0] text-right' : 'text-[#8696A0]'}`}>
                  {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1F2C34] rounded-xl px-4 py-3 rounded-tl-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-[#8696A0] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && !loading && (
          <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
            {['Montrez-moi vos boubous', 'Quels sont vos prix ?', 'Livraison possible ?'].map(
              (suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => {
                      setInput(suggestion);
                      handleSend();
                    }, 50);
                  }}
                  className="flex-shrink-0 bg-[#1F2C34] border border-[#2A3942] text-[#8696A0] text-xs rounded-full px-3 py-1.5 hover:bg-[#2A3942] hover:text-white transition"
                  data-testid={`demo-suggestion-${i}`}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        )}

        {/* Input */}
        <div className="bg-[#1F2C34] px-3 py-2 flex items-end gap-2 border-t border-[#2A3942]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tapez un message..."
            disabled={loading}
            className="flex-1 bg-[#2A3942] text-white rounded-full px-4 py-2.5 text-sm placeholder-[#8696A0] focus:outline-none"
            data-testid="demo-chat-input"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center hover:brightness-110 transition disabled:opacity-40"
            data-testid="demo-send-button"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
