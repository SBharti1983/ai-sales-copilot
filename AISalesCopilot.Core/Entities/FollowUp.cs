namespace AISalesCopilot.Core.Entities;

public class FollowUp
{
    public int Id { get; set; }
    public int LeadId { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Channel { get; set; } = "Email"; // Email, WhatsApp, SMS, Call
    public bool IsAiGenerated { get; set; }
    public bool IsSent { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Lead Lead { get; set; } = null!;
}
