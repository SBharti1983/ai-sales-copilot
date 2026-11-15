using Microsoft.AspNetCore.Mvc;
using AISalesCopilot.Core.DTOs;
using AISalesCopilot.Core.Entities;
using AISalesCopilot.Core.Interfaces;

namespace AISalesCopilot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IAiService _aiService;
    private readonly IConversationRepository _conversationRepo;

    public ChatController(IAiService aiService, IConversationRepository conversationRepo)
    {
        _aiService = aiService;
        _conversationRepo = conversationRepo;
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponseDto>> Chat([FromBody] ChatRequestDto request)
    {
        // Get conversation history
        var history = await _conversationRepo.GetByLeadIdAsync(request.LeadId);

        // Get AI response
        var response = await _aiService.ChatAsync(request.Message, request.LeadId, history);

        // Save conversation
        await _conversationRepo.CreateAsync(new Conversation
        {
            LeadId = request.LeadId,
            UserMessage = request.Message,
            AiResponse = response.Response,
            Intent = response.Intent
        });

        return Ok(response);
    }

    [HttpGet("history")]
    public async Task<ActionResult<List<Conversation>>> GetHistory([FromQuery] int? leadId)
    {
        var history = await _conversationRepo.GetByLeadIdAsync(leadId, 50);
        return Ok(history);
    }
}

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly ILeadRepository _leadRepo;

    public DashboardController(ILeadRepository leadRepo) => _leadRepo = leadRepo;

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> GetDashboard()
    {
        var dashboard = await _leadRepo.GetDashboardAsync();
        return Ok(dashboard);
    }
}

[ApiController]
[Route("api/[controller]")]
public class FollowUpsController : ControllerBase
{
    private readonly IFollowUpRepository _followUpRepo;
    private readonly ILeadRepository _leadRepo;
    private readonly IAiService _aiService;

    public FollowUpsController(IFollowUpRepository followUpRepo, ILeadRepository leadRepo, IAiService aiService)
    {
        _followUpRepo = followUpRepo;
        _leadRepo = leadRepo;
        _aiService = aiService;
    }

    [HttpGet("pending")]
    public async Task<ActionResult<List<FollowUpDto>>> GetPending()
    {
        var followUps = await _followUpRepo.GetPendingAsync();
        var result = followUps.Select(f => new FollowUpDto(
            f.Id, f.LeadId, f.Lead?.FullName ?? "", f.Message,
            f.Channel, f.IsAiGenerated, f.IsSent, f.ScheduledAt, f.CreatedAt
        )).ToList();
        return Ok(result);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<FollowUpDto>> Generate([FromBody] GenerateFollowUpDto request)
    {
        var lead = await _leadRepo.GetByIdAsync(request.LeadId);
        if (lead == null) return NotFound("Lead not found");

        var message = await _aiService.GenerateFollowUpMessageAsync(lead, request.Channel);

        var followUp = new FollowUp
        {
            LeadId = request.LeadId,
            Message = message,
            Channel = request.Channel,
            IsAiGenerated = true,
            ScheduledAt = DateTime.UtcNow.AddHours(1)
        };

        var created = await _followUpRepo.CreateAsync(followUp);
        return Ok(new FollowUpDto(
            created.Id, created.LeadId, lead.FullName, created.Message,
            created.Channel, created.IsAiGenerated, created.IsSent,
            created.ScheduledAt, created.CreatedAt
        ));
    }

    [HttpPost("{id}/send")]
    public async Task<ActionResult> MarkAsSent(int id)
    {
        await _followUpRepo.MarkAsSentAsync(id);
        return NoContent();
    }
}
