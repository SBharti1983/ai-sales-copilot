import React from 'react';
import { Sparkles, Bot, Plus, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenChat: () => void;
  onOpenAddLead: () => void;
  onBatchQualify: () => void;
  isBatchQualifying: boolean;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenChat,
  onOpenAddLead,
  onBatchQualify,
  isBatchQualifying,
}) => {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Platform Tag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
        }}>
          <Sparkles size={20} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px' }}>
              AI Sales Copilot
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '20px',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818CF8',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}>
              Semantic Kernel • .NET 9
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            Enterprise Autonomous Lead Qualification & Deal Acceleration
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection status indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          fontSize: '12px',
          color: '#34D399',
        }}>
          <span className="pulsing-dot" />
          <span>Backend Live (Local SQLite/SQL)</span>
        </div>

        {/* Batch Re-qualify */}
        <button
          className="btn-secondary"
          onClick={onBatchQualify}
          disabled={isBatchQualifying}
          style={{ fontSize: '13px' }}
          title="Run Semantic Kernel AI on all unscored leads"
        >
          <RefreshCw size={14} className={isBatchQualifying ? 'spin-icon' : ''} />
          {isBatchQualifying ? 'Analyzing...' : 'AI Batch Score'}
        </button>

        {/* Add Lead Button */}
        <button className="btn-secondary" onClick={onOpenAddLead} style={{ fontSize: '13px' }}>
          <Plus size={15} />
          <span>New Lead</span>
        </button>

        {/* AI Copilot Drawer Trigger */}
        <button
          className="btn-primary"
          onClick={onOpenChat}
          style={{ fontSize: '13px' }}
        >
          <Bot size={16} />
          <span>Open AI Copilot</span>
        </button>
      </div>
    </header>
  );
};
