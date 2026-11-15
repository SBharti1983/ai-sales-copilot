import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  intent?: string;
  time: string;
}

interface ChatCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadId?: number;
}

export const ChatCopilotDrawer: React.FC<ChatCopilotDrawerProps> = ({
  isOpen,
  onClose,
  selectedLeadId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello Sikandar! I'm your AI Sales Copilot connected directly to your CRM database. You can ask me to evaluate deals, prioritize follow-ups, or summarize pipeline health.",
      intent: 'greeting',
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await api.chat(textToSend, selectedLeadId);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.response,
        intent: res.intent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: "I couldn't reach the backend API right now. Please ensure the .NET 9 API is running.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Who are my top hot leads?',
    'Summarize my active pipeline',
    'Recommend next action for TechCorp India',
  ];

  if (!isOpen) return null;

  return (
    <aside className="chat-drawer">
      {/* Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(15, 23, 42, 0.7)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Bot size={18} color="#FFF" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Sales Copilot AI</div>
            <div style={{ fontSize: '11px', color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="pulsing-dot" style={{ width: '6px', height: '6px' }} />
              <span>Semantic Kernel Agent Live</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(255, 255, 255, 0.02)',
      }}>
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <HelpCircle size={12} />
          <span>Quick Prompts for Demo:</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{
                textAlign: 'left',
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11.5px',
                color: '#C7D2FE',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ⚡ {p}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              maxWidth: '88%',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            }}>
              {/* Avatar */}
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: msg.sender === 'user' ? 'var(--primary)' : '#1E293B',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {msg.sender === 'user' ? <User size={14} color="#FFF" /> : <Bot size={14} color="#818CF8" />}
              </div>

              {/* Message Bubble */}
              <div style={{
                background: msg.sender === 'user' ? 'var(--primary)' : 'rgba(30, 41, 59, 0.85)',
                color: '#FFF',
                padding: '10px 14px',
                borderRadius: msg.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                fontSize: '13px',
                lineHeight: '1.5',
                border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}>
                {msg.text}
              </div>
            </div>

            {/* Meta tag */}
            <div style={{
              fontSize: '10px',
              color: 'var(--text-dim)',
              marginTop: '4px',
              marginRight: msg.sender === 'user' ? '34px' : '0',
              marginLeft: msg.sender === 'user' ? '0' : '34px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span>{msg.time}</span>
              {msg.intent && (
                <span style={{
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#A5B4FC',
                }}>
                  Intent: {msg.intent}
                </span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818CF8', fontSize: '12px' }}>
            <Sparkles size={14} className="spin-icon" />
            <span>Semantic Kernel reasoning...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.9)',
      }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            type="text"
            placeholder="Ask Copilot anything about your CRM..."
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#FFF',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !input.trim()}
            style={{ padding: '0 14px' }}
          >
            <Send size={15} />
          </button>
        </form>
        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px', textAlign: 'center' }}>
          Powered by Azure OpenAI & Semantic Kernel • .NET 9 Web API
        </div>
      </div>
    </aside>
  );
};
