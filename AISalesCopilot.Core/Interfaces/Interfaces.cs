using AISalesCopilot.Core.DTOs;
using AISalesCopilot.Core.Entities;

namespace AISalesCopilot.Core.Interfaces;

public interface ILeadRepository
{
    Task<Lead?> GetByIdAsync(int id);
    Task<List<Lead>> GetAllAsync();
    Task<Lead> CreateAsync(Lead lead);
    Task<Lead> UpdateAsync(Lead lead);
    Task DeleteAsync(int id);
    Task<DashboardDto> GetDashboardAsync();
}

public interface IAiService
{
    Task<QualificationResultDto> QualifyLeadAsync(Lead lead);
    Task<ChatResponseDto> ChatAsync(string message, int? leadId, List<Conversation>? history);
    Task<string> GenerateFollowUpMessageAsync(Lead lead, string channel);
}

public interface IConversationRepository
{
    Task<List<Conversation>> GetByLeadIdAsync(int? leadId, int limit = 10);
    Task<Conversation> CreateAsync(Conversation conversation);
}

public interface IFollowUpRepository
{
    Task<List<FollowUp>> GetByLeadIdAsync(int leadId);
    Task<List<FollowUp>> GetPendingAsync();
    Task<FollowUp> CreateAsync(FollowUp followUp);
    Task MarkAsSentAsync(int id);
}
