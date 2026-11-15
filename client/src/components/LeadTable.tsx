import React, { useState } from 'react';
import { Search, Flame, Zap, Snowflake, Mail, Sparkles, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';
import type { Lead } from '../types';

interface LeadTableProps {
  leads: Lead[];
  onQualify: (id: number) => Promise<void>;
  onOpenFollowUp: (lead: Lead) => void;
  qualifyingId: number | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  onQualify,
  onOpenFollowUp,
  qualifyingId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterScore, setFilterScore] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const getScoreBadge = (score: number, confidence?: number) => {
    switch (score) {
      case 2:
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'var(--accent-hot-bg)',
            border: '1px solid var(--accent-hot-border)',
            color: '#F87171',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            <Flame size={13} color="#EF4444" />
            <span>HOT {confidence ? `(${Math.round(confidence * 100)}%)` : ''}</span>
          </div>
        );
      case 1:
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'var(--accent-warm-bg)',
            border: '1px solid var(--accent-warm-border)',
            color: '#FBBF24',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            <Zap size={13} color="#F59E0B" />
            <span>WARM {confidence ? `(${Math.round(confidence * 100)}%)` : ''}</span>
          </div>
        );
      default:
        return (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 10px',
            borderRadius: '20px',
            background: 'var(--accent-cold-bg)',
            border: '1px solid var(--accent-cold-border)',
            color: '#60A5FA',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            <Snowflake size={13} color="#3B82F6" />
            <span>COLD {confidence ? `(${Math.round(confidence * 100)}%)` : ''}</span>
          </div>
        );
    }
  };

  const getStatusText = (status: number | string) => {
    const s = Number(status);
    switch (s) {
      case 0: return { label: 'New Lead', color: '#818CF8' };
      case 1: return { label: 'Contacted', color: '#FBBF24' };
      case 2: return { label: 'Qualified', color: '#34D399' };
      case 4: return { label: 'Follow Up', color: '#A78BFA' };
      case 5: return { label: 'Converted', color: '#10B981' };
      default: return { label: 'Active', color: '#94A3B8' };
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterScore === 'all') return matchesSearch;
    if (filterScore === 'hot') return matchesSearch && lead.score === 2;
    if (filterScore === 'warm') return matchesSearch && lead.score === 1;
    if (filterScore === 'cold') return matchesSearch && lead.score === 0;
    return matchesSearch;
  });

  return (
    <div className="glass-panel" style={{ padding: '24px' }}>
      {/* Table Header Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
            Enterprise Leads Pipeline
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time lead scoring powered by Azure OpenAI and Semantic Kernel
          </p>
        </div>

        {/* Filters and Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '3px',
          }}>
            {[
              { id: 'all', label: `All (${leads.length})` },
              { id: 'hot', label: `🔥 Hot (${leads.filter(l => l.score === 2).length})` },
              { id: 'warm', label: `⚡ Warm (${leads.filter(l => l.score === 1).length})` },
              { id: 'cold', label: `❄️ Cold (${leads.filter(l => l.score === 0).length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterScore(tab.id)}
                style={{
                  background: filterScore === tab.id ? 'var(--primary)' : 'transparent',
                  color: filterScore === tab.id ? '#FFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 12px',
            width: '220px',
          }}>
            <Search size={14} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search leads or company..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '12px 16px' }}>Account & Contact</th>
              <th style={{ padding: '12px 16px' }}>Budget</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px' }}>AI Qualification</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => {
              const isExpanded = expandedId === lead.id;
              const isQualifying = qualifyingId === lead.id;
              const statusInfo = getStatusText(lead.status);

              return (
                <React.Fragment key={lead.id}>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.15s ease',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : lead.id)}
                  >
                    {/* Contact & Company */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#A5B4FC',
                        }}>
                          {lead.company.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                            {lead.company}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {lead.fullName} {lead.designation ? `• ${lead.designation}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Budget */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600' }}>
                      ₹{lead.budget.toLocaleString('en-IN')}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: statusInfo.color,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                      }}>
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* AI Score */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getScoreBadge(lead.score, lead.aiConfidenceScore)}
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          <span>Details</span>
                        </span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ padding: '14px 16px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        {/* Qualify Button */}
                        <button
                          className="btn-secondary"
                          onClick={() => onQualify(lead.id)}
                          disabled={isQualifying}
                          style={{
                            fontSize: '12px',
                            padding: '6px 10px',
                            background: isQualifying ? 'rgba(99, 102, 241, 0.2)' : undefined,
                          }}
                          title="Run real-time Semantic Kernel scoring"
                        >
                          <Sparkles size={13} color="#818CF8" />
                          <span>{isQualifying ? 'Scoring...' : 'AI Qualify'}</span>
                        </button>

                        {/* Follow up outreach */}
                        <button
                          className="btn-primary"
                          onClick={() => onOpenFollowUp(lead)}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          <Mail size={13} />
                          <span>Draft Outreach</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded AI Insight Panel */}
                  {isExpanded && (
                    <tr style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                      <td colSpan={5} style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                          {/* AI Evaluation */}
                          <div style={{
                            padding: '14px',
                            borderRadius: '10px',
                            background: 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <Sparkles size={14} color="#818CF8" />
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC' }}>
                                AI Qualification Assessment
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '8px' }}>
                              {lead.aiQualificationReason || 'Click "AI Qualify" to generate real-time reasoning via Semantic Kernel.'}
                            </p>
                            <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Clock size={12} />
                              <span>Model: Azure OpenAI gpt-4o-mini • Confidence: {lead.aiConfidenceScore ? `${Math.round(lead.aiConfidenceScore * 100)}%` : 'Pending'}</span>
                            </div>
                          </div>

                          {/* Recommended Next Step */}
                          <div style={{
                            padding: '14px',
                            borderRadius: '10px',
                            background: 'rgba(16, 185, 129, 0.05)',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <CheckCircle size={14} color="#34D399" />
                              <span style={{ fontSize: '12px', fontWeight: '700', color: '#34D399' }}>
                                Strategic Follow-Up Recommendation
                              </span>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-main)', lineHeight: '1.5', marginBottom: '8px' }}>
                              {lead.aiSuggestedFollowUp || 'Recommend initial discovery call with technical architect.'}
                            </p>
                            <button
                              onClick={() => onOpenFollowUp(lead)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#34D399',
                                fontSize: '11px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                padding: 0,
                              }}
                            >
                              Generate multi-channel message for this lead →
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
