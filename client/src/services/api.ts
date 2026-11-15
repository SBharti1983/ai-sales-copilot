import type { Lead, DashboardData, QualificationResult, ChatResponse, FollowUpResult } from '../types';

const API_BASE = '/api';

export const api = {
  async getLeads(): Promise<Lead[]> {
    const res = await fetch(`${API_BASE}/leads`);
    if (!res.ok) throw new Error('Failed to fetch leads');
    return res.json();
  },

  async getLead(id: number): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads/${id}`);
    if (!res.ok) throw new Error('Failed to fetch lead');
    return res.json();
  },

  async createLead(lead: Partial<Lead>): Promise<Lead> {
    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: lead.fullName,
        email: lead.email,
        phone: lead.phone || '',
        company: lead.company,
        designation: lead.designation || 'Decision Maker',
        source: Number(lead.source) || 0,
        budget: Number(lead.budget) || 0,
        requirements: lead.requirements || '',
        notes: lead.notes || ''
      }),
    });
    if (!res.ok) throw new Error('Failed to create lead');
    return res.json();
  },

  async qualifyLead(id: number): Promise<QualificationResult> {
    const res = await fetch(`${API_BASE}/leads/${id}/qualify`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to qualify lead');
    return res.json();
  },

  async qualifyAll(): Promise<QualificationResult[]> {
    const res = await fetch(`${API_BASE}/leads/qualify-all`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to batch qualify');
    return res.json();
  },

  async getDashboard(): Promise<DashboardData> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    return res.json();
  },

  async chat(message: string, leadId?: number): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, leadId: leadId || null }),
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  async generateFollowUp(leadId: number, channel: string): Promise<FollowUpResult> {
    const res = await fetch(`${API_BASE}/followups/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leadId, channel }),
    });
    if (!res.ok) throw new Error('Failed to generate follow-up');
    return res.json();
  },

  async markFollowUpSent(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/followups/${id}/send`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to mark sent');
  }
};
