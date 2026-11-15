using Microsoft.EntityFrameworkCore;
using AISalesCopilot.Core.DTOs;
using AISalesCopilot.Core.Entities;
using AISalesCopilot.Core.Interfaces;
using AISalesCopilot.Infrastructure.Data;

namespace AISalesCopilot.Infrastructure.Repositories;

public class LeadRepository : ILeadRepository
{
    private readonly AppDbContext _context;

    public LeadRepository(AppDbContext context) => _context = context;

    public async Task<Lead?> GetByIdAsync(int id)
        => await _context.Leads
            .Include(l => l.FollowUps)
            .FirstOrDefaultAsync(l => l.Id == id);

    public async Task<List<Lead>> GetAllAsync()
        => await _context.Leads
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

    public async Task<Lead> CreateAsync(Lead lead)
    {
        _context.Leads.Add(lead);
        await _context.SaveChangesAsync();
        return lead;
    }

    public async Task<Lead> UpdateAsync(Lead lead)
    {
        lead.UpdatedAt = DateTime.UtcNow;
        _context.Leads.Update(lead);
        await _context.SaveChangesAsync();
        return lead;
    }

    public async Task DeleteAsync(int id)
    {
        var lead = await _context.Leads.FindAsync(id);
        if (lead != null)
        {
            _context.Leads.Remove(lead);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<DashboardDto> GetDashboardAsync()
    {
        var leads = await _context.Leads.ToListAsync();
        var oneWeekAgo = DateTime.UtcNow.AddDays(-7);

        return new DashboardDto(
            TotalLeads: leads.Count,
            HotLeads: leads.Count(l => l.Score == Core.Enums.LeadScore.Hot),
            WarmLeads: leads.Count(l => l.Score == Core.Enums.LeadScore.Warm),
            ColdLeads: leads.Count(l => l.Score == Core.Enums.LeadScore.Cold),
            ConvertedLeads: leads.Count(l => l.Status == Core.Enums.LeadStatus.Converted),
            NewLeadsThisWeek: leads.Count(l => l.CreatedAt >= oneWeekAgo),
            PendingFollowUps: await _context.FollowUps.CountAsync(f => !f.IsSent),
            TotalPipelineValue: leads.Where(l => l.Status != Core.Enums.LeadStatus.Lost).Sum(l => l.Budget),
            LeadsBySource: leads.GroupBy(l => l.Source.ToString())
                .Select(g => new LeadsBySourceDto(g.Key, g.Count())).ToList(),
            LeadsByStatus: leads.GroupBy(l => l.Status.ToString())
                .Select(g => new LeadsByStatusDto(g.Key, g.Count())).ToList()
        );
    }
}

public class ConversationRepository : IConversationRepository
{
    private readonly AppDbContext _context;

    public ConversationRepository(AppDbContext context) => _context = context;

    public async Task<List<Conversation>> GetByLeadIdAsync(int? leadId, int limit = 10)
        => await _context.Conversations
            .Where(c => c.LeadId == leadId)
            .OrderByDescending(c => c.CreatedAt)
            .Take(limit)
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();

    public async Task<Conversation> CreateAsync(Conversation conversation)
    {
        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();
        return conversation;
    }
}

public class FollowUpRepository : IFollowUpRepository
{
    private readonly AppDbContext _context;

    public FollowUpRepository(AppDbContext context) => _context = context;

    public async Task<List<FollowUp>> GetByLeadIdAsync(int leadId)
        => await _context.FollowUps
            .Where(f => f.LeadId == leadId)
            .OrderByDescending(f => f.CreatedAt)
            .ToListAsync();

    public async Task<List<FollowUp>> GetPendingAsync()
        => await _context.FollowUps
            .Include(f => f.Lead)
            .Where(f => !f.IsSent)
            .OrderBy(f => f.ScheduledAt)
            .ToListAsync();

    public async Task<FollowUp> CreateAsync(FollowUp followUp)
    {
        _context.FollowUps.Add(followUp);
        await _context.SaveChangesAsync();
        return followUp;
    }

    public async Task MarkAsSentAsync(int id)
    {
        var followUp = await _context.FollowUps.FindAsync(id);
        if (followUp != null)
        {
            followUp.IsSent = true;
            await _context.SaveChangesAsync();
        }
    }
}
