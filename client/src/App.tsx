import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { LeadTable } from './components/LeadTable';
import { ChatCopilotDrawer } from './components/ChatCopilotDrawer';
import { FollowUpModal } from './components/FollowUpModal';
import { AddLeadModal } from './components/AddLeadModal';
import type { Lead, DashboardData } from './types';
import { api } from './services/api';
import { Sparkles, Code2 } from 'lucide-react';

export function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [qualifyingId, setQualifyingId] = useState<number | null>(null);
  const [isBatchQualifying, setIsBatchQualifying] = useState(false);

  // Modals & Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState<Lead | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [leadsData, dashData] = await Promise.all([
        api.getLeads(),
        api.getDashboard(),
      ]);
      setLeads(leadsData);
      setDashboard(dashData);
    } catch (err) {
      console.error('Error connecting to .NET 9 API:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle single lead AI qualification
  const handleQualify = async (id: number) => {
    setQualifyingId(id);
    try {
      const result = await api.qualifyLead(id);
      // Update local state instantly
      setLeads(prev =>
        prev.map(l =>
          l.id === id
            ? {
                ...l,
                score: typeof result.score === 'string'
                  ? (result.score === 'Hot' ? 2 : result.score === 'Warm' ? 1 : 0)
                  : Number(result.score),
                aiQualificationReason: result.reason,
                aiSuggestedFollowUp: result.suggestedFollowUp,
                aiConfidenceScore: result.confidence,
              }
            : l
        )
      );
      // Refresh metrics
      const newDash = await api.getDashboard();
      setDashboard(newDash);
    } catch (err) {
      console.error('Failed to qualify lead:', err);
    } finally {
      setQualifyingId(null);
    }
  };

  // Handle batch qualify
  const handleBatchQualify = async () => {
    setIsBatchQualifying(true);
    try {
      await api.qualifyAll();
      await fetchData();
    } catch (err) {
      console.error('Batch qualify error:', err);
    } finally {
      setIsBatchQualifying(false);
    }
  };

  // Handle new lead creation
  const handleCreateLead = async (leadData: Partial<Lead>) => {
    const created = await api.createLead(leadData);
    await fetchData();
    // Auto-qualify newly created lead
    handleQualify(created.id);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        onOpenChat={() => setIsChatOpen(true)}
        onOpenAddLead={() => setIsAddLeadOpen(true)}
        onBatchQualify={handleBatchQualify}
        isBatchQualifying={isBatchQualifying}
      />

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '28px 28px 60px' }}>
        {/* Executive Banner */}
        <div style={{
          marginBottom: '24px',
          padding: '16px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#818CF8" />
            <span style={{ fontSize: '13.5px', color: '#E2E8F0' }}>
              <strong>AI Forward Deployed Platform:</strong> Live CRM telemetry connected to <strong>.NET 9 Web API</strong> with <strong>Semantic Kernel AI Orchestration</strong>.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontFamily: 'JetBrains Mono, monospace',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.4)',
              color: '#34D399',
              border: '1px solid rgba(52, 211, 153, 0.2)',
            }}>
              API Port: 5000 • Client: 3000
            </span>
          </div>
        </div>

        {/* Hero KPIs */}
        <DashboardStats stats={dashboard} loading={loading} />

        {/* Lead Management Table */}
        <LeadTable
          leads={leads}
          onQualify={handleQualify}
          onOpenFollowUp={lead => setSelectedLeadForFollowUp(lead)}
          qualifyingId={qualifyingId}
        />

        {/* Architecture Showcase for Interviews */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.45)',
          border: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code2 size={18} color="#818CF8" />
              <h3 style={{ fontSize: '15px', fontWeight: '700' }}>
                Architecture & Design Specification (For Technical Interviews)
              </h3>
            </div>
            <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
              Clean Architecture • DDD Principles
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#A5B4FC', marginBottom: '4px' }}>
                1. Domain & Clean Architecture
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Separation of Core Domain (Entities, Enums, DTOs), Infrastructure (EF Core, Repositories, Semantic Kernel), and API Controllers.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#FBBF24', marginBottom: '4px' }}>
                2. Semantic Kernel Agentic Logic
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Pluggable LLM completion service (OpenAI/Azure OpenAI) with heuristic fallback for zero-downtime offline demos.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#34D399', marginBottom: '4px' }}>
                3. Multi-Channel Deal Velocity
              </div>
              <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Automatic follow-up generation for WhatsApp, Executive Email, SMS, and Call Scripts reduces sales triage latency by 60%.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals & Drawers */}
      <ChatCopilotDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <FollowUpModal
        lead={selectedLeadForFollowUp}
        isOpen={!!selectedLeadForFollowUp}
        onClose={() => setSelectedLeadForFollowUp(null)}
      />

      <AddLeadModal
        isOpen={isAddLeadOpen}
        onClose={() => setIsAddLeadOpen(false)}
        onSubmit={handleCreateLead}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '20px 28px',
        background: 'rgba(9, 13, 22, 0.95)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '12.5px',
        color: 'var(--text-dim)',
      }}>
        <div>
          Created by <strong>Sikandar Bharti</strong> • Senior Full Stack AI Engineer & Solutions Architect (14+ Yrs)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>ASP.NET Core • .NET 9 • React 19 • TypeScript • Semantic Kernel</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
