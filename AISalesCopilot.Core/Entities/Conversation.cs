namespace AISalesCopilot.Core.Entities;

public class Conversation
{
    public int Id { get; set; }
    public int? LeadId { get; set; }
    public string UserMessage { get; set; } = string.Empty;
    public string AiResponse { get; set; } = string.Empty;
    public string? Intent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation
    public Lead? Lead { get; set; }
}
