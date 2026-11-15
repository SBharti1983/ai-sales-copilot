using AISalesCopilot.Core.Enums;

namespace AISalesCopilot.Core.Entities;

public class Lead
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    
    // Lead Details
    public LeadSource Source { get; set; }
    public LeadStatus Status { get; set; } = LeadStatus.New;
    public LeadScore Score { get; set; } = LeadScore.Cold;
    public decimal Budget { get; set; }
    public string Requirements { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    
    // AI-Generated Fields
    public string? AiQualificationReason { get; set; }
    public string? AiSuggestedFollowUp { get; set; }
    public double? AiConfidenceScore { get; set; }
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastContactedAt { get; set; }
    public DateTime? NextFollowUpAt { get; set; }
    
    // Navigation
    public ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
}
