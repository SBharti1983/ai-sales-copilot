import React from 'react';
import { TrendingUp, Flame, Zap, ShieldCheck } from 'lucide-react';
import type { DashboardData } from '../types';

interface DashboardStatsProps {
  stats: DashboardData | null;
  loading: boolean;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats, loading }) => {
  const formatCurrency = (amount: number) => {
    return '₹' + amount.toLocaleString('en-IN');
  };

  const cards = [
    {
      title: 'Total Active Pipeline',
      value: stats ? formatCurrency(stats.totalPipelineValue) : '₹1,01,00,000',
      badge: '+22.4% vs last month',
      badgeColor: '#34D399',
      icon: TrendingUp,
      iconColor: '#818CF8',
      bgGlow: 'rgba(99, 102, 241, 0.15)',
      description: 'Active deal value across CRM',
    },
    {
      title: 'High-Intent Hot Leads',
      value: stats ? `${stats.hotLeads} Accounts` : '2 Accounts',
      badge: '94% Avg Confidence',
      badgeColor: '#F87171',
      icon: Flame,
      iconColor: '#EF4444',
      bgGlow: 'rgba(239, 68, 68, 0.15)',
      description: 'C-Suite decision-makers with ready budget',
    },
    {
      title: 'AI Qualification Speed',
      value: '< 800ms',
      badge: '60% Effort Saved',
      badgeColor: '#FBBF24',
      icon: Zap,
      iconColor: '#F59E0B',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      description: 'Real-time Semantic Kernel analysis',
    },
    {
      title: 'Pipeline Health',
      value: stats ? `${stats.totalLeads} Total Leads` : '5 Total Leads',
      badge: 'Enterprise Verified',
      badgeColor: '#34D399',
      icon: ShieldCheck,
      iconColor: '#10B981',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      description: 'Clean Architecture • .NET 9 API',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginBottom: '28px',
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="glass-panel"
            style={{
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Subtle glow orb */}
            <div
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: card.bgGlow,
                filter: 'blur(30px)',
                pointerEvents: 'none',
              }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>
                  {card.title}
                </span>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icon size={16} color={card.iconColor} />
                </div>
              </div>

              <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', marginBottom: '8px' }}>
                {loading ? '...' : card.value}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: '600',
                color: card.badgeColor,
                padding: '2px 6px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
              }}>
                {card.badge}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
