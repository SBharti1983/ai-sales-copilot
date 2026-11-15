using AISalesCopilot.Core.Enums;

namespace AISalesCopilot.Core.DTOs;

// --- Lead DTOs ---
public record CreateLeadDto(
    string FullName,
    string Email,
    string Phone,
    string Company,
    string Designation,
    LeadSource Source,
    decimal Budget,
    string Requirements,
    string? Notes
);

public record UpdateLeadDto(
    string? FullName,
    string? Email,
    string? Phone,
    string? Company,
    string? Designation,
    LeadStatus? Status,
    decimal? Budget,
    string? Requirements,
    string? Notes,
    DateTime? NextFollowUpAt
);

public record LeadDto(
    int Id,
    string FullName,
    string Email,
    string Phone,
    string Company,
    string Designation,
    LeadSource Source,
    LeadStatus Status,
    LeadScore Score,
    decimal Budget,
    string Requirements,
    string? Notes,
    string? AiQualificationReason,
    string? AiSuggestedFollowUp,
    double? AiConfidenceScore,
    DateTime CreatedAt,
    DateTime? LastContactedAt,
    DateTime? NextFollowUpAt
);

public record LeadListDto(
    int Id,
    string FullName,
    string Company,
    LeadStatus Status,
    LeadScore Score,
    decimal Budget,
    double? AiConfidenceScore,
    DateTime CreatedAt,
    DateTime? NextFollowUpAt
);

// --- Chat DTOs ---
public record ChatRequestDto(string Message, int? LeadId);

public record ChatResponseDto(string Response, string? Intent, int? LeadId);

// --- AI Qualification DTOs ---
public record QualificationResultDto(
    LeadScore Score,
    string Reason,
    string SuggestedFollowUp,
    double Confidence
);

// --- Follow-Up DTOs ---
public record FollowUpDto(
    int Id,
    int LeadId,
    string LeadName,
    string Message,
    string Channel,
    bool IsAiGenerated,
    bool IsSent,
    DateTime? ScheduledAt,
    DateTime CreatedAt
);

public record GenerateFollowUpDto(int LeadId, string Channel);

// --- Dashboard DTOs ---
public record DashboardDto(
    int TotalLeads,
    int HotLeads,
    int WarmLeads,
    int ColdLeads,
    int ConvertedLeads,
    int NewLeadsThisWeek,
    int PendingFollowUps,
    decimal TotalPipelineValue,
    List<LeadsBySourceDto> LeadsBySource,
    List<LeadsByStatusDto> LeadsByStatus
);

public record LeadsBySourceDto(string Source, int Count);
public record LeadsByStatusDto(string Status, int Count);

// --- Auth DTOs ---
public record LoginDto(string Email, string Password);
public record TokenDto(string Token, string Email, string Role, DateTime Expiry);
