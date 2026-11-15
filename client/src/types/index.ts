export interface Lead {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  company: string;
  designation?: string;
  source?: number | string;
  status: number | string;
  score: number; // 0 = Cold, 1 = Warm, 2 = Hot
  budget: number;
  requirements?: string;
  notes?: string;
  aiQualificationReason?: string;
  aiSuggestedFollowUp?: string;
  aiConfidenceScore?: number;
  createdAt: string;
  nextFollowUpAt?: string;
}

export interface DashboardData {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  convertedLeads: number;
  newLeadsThisWeek: number;
  pendingFollowUps: number;
  totalPipelineValue: number;
  leadsBySource: { source: string; count: number }[];
  leadsByStatus: { status: string; count: number }[];
}

export interface QualificationResult {
  score: number | string;
  reason: string;
  suggestedFollowUp: string;
  confidence: number;
}

export interface ChatResponse {
  response: string;
  intent?: string;
  leadId?: number;
}

export interface FollowUpResult {
  id: number;
  leadId: number;
  leadName: string;
  message: string;
  channel: string;
  isAiGenerated: boolean;
  isSent: boolean;
  scheduledAt?: string;
  createdAt: string;
}
