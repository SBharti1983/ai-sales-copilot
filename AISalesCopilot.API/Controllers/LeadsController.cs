using Microsoft.AspNetCore.Mvc;
using AISalesCopilot.Core.DTOs;
using AISalesCopilot.Core.Entities;
using AISalesCopilot.Core.Interfaces;

namespace AISalesCopilot.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeadsController : ControllerBase
{
    private readonly ILeadRepository _leadRepo;
    private readonly IAiService _aiService;

    public LeadsController(ILeadRepository leadRepo, IAiService aiService)
    {
        _leadRepo = leadRepo;
        _aiService = aiService;
    }

    [HttpGet]
    public async Task<ActionResult<List<LeadListDto>>> GetAll()
    {
        var leads = await _leadRepo.GetAllAsync();
        var result = leads.Select(l => new LeadListDto(
            l.Id, l.FullName, l.Company, l.Status, l.Score,
            l.Budget, l.AiConfidenceScore, l.CreatedAt, l.NextFollowUpAt
        )).ToList();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<LeadDto>> GetById(int id)
    {
        var lead = await _leadRepo.GetByIdAsync(id);
        if (lead == null) return NotFound();

        var dto = new LeadDto(
            lead.Id, lead.FullName, lead.Email, lead.Phone,
            lead.Company, lead.Designation, lead.Source, lead.Status,
            lead.Score, lead.Budget, lead.Requirements, lead.Notes,
            lead.AiQualificationReason, lead.AiSuggestedFollowUp,
            lead.AiConfidenceScore, lead.CreatedAt, lead.LastContactedAt,
            lead.NextFollowUpAt
        );
        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult<LeadDto>> Create([FromBody] CreateLeadDto dto)
    {
        var lead = new Lead
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Phone = dto.Phone,
            Company = dto.Company,
            Designation = dto.Designation,
            Source = dto.Source,
            Budget = dto.Budget,
            Requirements = dto.Requirements,
            Notes = dto.Notes ?? string.Empty
        };

        var created = await _leadRepo.CreateAsync(lead);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> Update(int id, [FromBody] UpdateLeadDto dto)
    {
        var lead = await _leadRepo.GetByIdAsync(id);
        if (lead == null) return NotFound();

        if (dto.FullName != null) lead.FullName = dto.FullName;
        if (dto.Email != null) lead.Email = dto.Email;
        if (dto.Phone != null) lead.Phone = dto.Phone;
        if (dto.Company != null) lead.Company = dto.Company;
        if (dto.Designation != null) lead.Designation = dto.Designation;
        if (dto.Status.HasValue) lead.Status = dto.Status.Value;
        if (dto.Budget.HasValue) lead.Budget = dto.Budget.Value;
        if (dto.Requirements != null) lead.Requirements = dto.Requirements;
        if (dto.Notes != null) lead.Notes = dto.Notes;
        if (dto.NextFollowUpAt.HasValue) lead.NextFollowUpAt = dto.NextFollowUpAt.Value;

        await _leadRepo.UpdateAsync(lead);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _leadRepo.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/qualify")]
    public async Task<ActionResult<QualificationResultDto>> QualifyLead(int id)
    {
        var lead = await _leadRepo.GetByIdAsync(id);
        if (lead == null) return NotFound();

        var result = await _aiService.QualifyLeadAsync(lead);

        // Update lead with AI results
        lead.Score = result.Score;
        lead.AiQualificationReason = result.Reason;
        lead.AiSuggestedFollowUp = result.SuggestedFollowUp;
        lead.AiConfidenceScore = result.Confidence;
        await _leadRepo.UpdateAsync(lead);

        return Ok(result);
    }

    [HttpPost("qualify-all")]
    public async Task<ActionResult<List<QualificationResultDto>>> QualifyAll()
    {
        var leads = await _leadRepo.GetAllAsync();
        var results = new List<QualificationResultDto>();

        foreach (var lead in leads.Where(l => l.AiConfidenceScore == null))
        {
            var result = await _aiService.QualifyLeadAsync(lead);
            lead.Score = result.Score;
            lead.AiQualificationReason = result.Reason;
            lead.AiSuggestedFollowUp = result.SuggestedFollowUp;
            lead.AiConfidenceScore = result.Confidence;
            await _leadRepo.UpdateAsync(lead);
            results.Add(result);
        }

        return Ok(results);
    }
}
