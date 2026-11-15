import React, { useState, useEffect } from 'react';
import { X, Copy, Check, MessageSquare, Mail, Phone, Smartphone, Sparkles, Send } from 'lucide-react';
import type { Lead } from '../types';
import { api } from '../services/api';

interface FollowUpModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FollowUpModal: React.FC<FollowUpModalProps> = ({ lead, isOpen, onClose }) => {
  const [activeChannel, setActiveChannel] = useState<'Email' | 'WhatsApp' | 'SMS' | 'Call'>('WhatsApp');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (lead && isOpen) {
      loadMessage(activeChannel);
    }
  }, [lead, isOpen, activeChannel]);

  const loadMessage = async (channel: string) => {
    if (!lead) return;
    setLoading(true);
    setCopied(false);
    setSentSuccess(false);
    try {
      const res = await api.generateFollowUp(lead.id, channel);
      setGeneratedMessage(res.message);
    } catch {
      setGeneratedMessage("Failed to reach AI service for follow-up generation. Ensure API is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen || !lead) return null;

  const channels = [
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageSquare },
    { id: 'Email', label: 'Executive Email', icon: Mail },
    { id: 'SMS', label: 'SMS Alert', icon: Smartphone },
    { id: 'Call', label: 'Phone Script', icon: Phone },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#818CF8" />
              <h3 style={{ fontSize: '17px', fontWeight: '700' }}>
                AI Follow-Up Generator
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Tailored outreach for <strong>{lead.fullName}</strong> ({lead.company})
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Channel Selection Tabs */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
        }}>
          {channels.map(ch => {
            const Icon = ch.icon;
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#A5B4FC' : 'var(--text-muted)',
                  fontSize: '12.5px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{ch.label}</span>
              </button>
            );
          })}
        </div>

        {/* Message Body */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {activeChannel} Content (Semantic Kernel Personalized)
            </span>
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              {copied ? <Check size={13} color="#34D399" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Text'}</span>
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              value={loading ? 'Generating tailored message via Semantic Kernel...' : generatedMessage}
              onChange={e => setGeneratedMessage(e.target.value)}
              rows={activeChannel === 'Email' || activeChannel === 'Call' ? 10 : 4}
              style={{
                width: '100%',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '14px',
                color: 'var(--text-main)',
                fontSize: '13px',
                lineHeight: '1.6',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Lead Context Snippet */}
          <div style={{
            marginTop: '16px',
            padding: '12px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            fontSize: '11.5px',
            color: 'var(--text-dim)',
          }}>
            <strong>Target Context:</strong> Budget: ₹{lead.budget.toLocaleString('en-IN')} • Requirement: "{lead.requirements || 'Standard enterprise CRM'}"
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.7)',
        }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: '13px' }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={loading || sentSuccess}
            style={{ fontSize: '13px' }}
          >
            {sentSuccess ? <Check size={15} color="#34D399" /> : <Send size={15} />}
            <span>{sentSuccess ? 'Recorded as Sent!' : `Dispatch via ${activeChannel}`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
