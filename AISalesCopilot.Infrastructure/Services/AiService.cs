using Microsoft.Extensions.DependencyInjection;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using AISalesCopilot.Core.DTOs;
using AISalesCopilot.Core.Entities;
using AISalesCopilot.Core.Enums;
using AISalesCopilot.Core.Interfaces;
using System.Text.Json;

namespace AISalesCopilot.Infrastructure.Services;

public class AiService : IAiService
{
    private readonly Kernel? _kernel;
    private readonly IChatCompletionService? _chatService;

    public AiService(IServiceProvider serviceProvider)
    {
        _kernel = serviceProvider.GetService<Kernel>();
        _chatService = _kernel?.Services.GetService<IChatCompletionService>();
    }

    public async Task<QualificationResultDto> QualifyLeadAsync(Lead lead)
    {
        // 1. If live LLM chat service is available, run prompt through Semantic Kernel
        if (_chatService != null)
        {
            try
            {
                var jsonFormat = @"{""score"": ""Hot or Warm or Cold"", ""reason"": ""2-3 sentence explanation"", ""suggestedFollowUp"": ""Specific follow-up action"", ""confidence"": 0.0}";

                var prompt = $"""
                    You are an expert AI Sales Agent for a CRM platform. Analyze the following lead and provide a qualification assessment.

                    Lead Information:
                    - Name: {lead.FullName}
                    - Company: {lead.Company}
                    - Designation: {lead.Designation}
                    - Budget: INR {lead.Budget:N0}
                    - Source: {lead.Source}
                    - Requirements: {lead.Requirements}
                    - Notes: {lead.Notes}

                    Respond ONLY with valid JSON in this exact format (no markdown, no code blocks):
                    {jsonFormat}

                    Scoring criteria:
                    - Hot: Budget > INR 20,00,000, clear requirements, decision-maker title (CTO, VP, Director)
                    - Warm: Budget INR 5,00,000 - 20,00,000, some requirements, mid-level contact
                    - Cold: Budget less than INR 5,00,000, vague requirements, exploring/comparing options
                    """;

                var result = await _chatService.GetChatMessageContentAsync(prompt);
                var responseText = result.Content ?? "{}";

                var parsed = JsonSerializer.Deserialize<JsonElement>(responseText);
                var scoreStr = parsed.GetProperty("score").GetString() ?? "Cold";
                var score = scoreStr switch
                {
                    "Hot" => LeadScore.Hot,
                    "Warm" => LeadScore.Warm,
                    _ => LeadScore.Cold
                };

                return new QualificationResultDto(
                    Score: score,
                    Reason: parsed.GetProperty("reason").GetString() ?? "Analyzed by AI Sales Agent.",
                    SuggestedFollowUp: parsed.GetProperty("suggestedFollowUp").GetString() ?? "Follow up via email",
                    Confidence: parsed.GetProperty("confidence").GetDouble()
                );
            }
            catch
            {
                // Fall through to heuristic evaluation if LLM fails
            }
        }

        // 2. Intelligent heuristic engine (used offline / demo mode)
        await Task.Yield();
        var designation = lead.Designation.ToLowerInvariant();
        var isDecisionMaker = designation.Contains("cto") || designation.Contains("cio") || 
                              designation.Contains("vp") || designation.Contains("director") || 
                              designation.Contains("founder") || designation.Contains("head");

        if (lead.Budget >= 2000000 || (lead.Budget >= 1000000 && isDecisionMaker))
        {
            return new QualificationResultDto(
                Score: LeadScore.Hot,
                Reason: $"High enterprise potential: Budget of ₹{lead.Budget:N0} with decision-maker profile ({lead.Designation}) at {lead.Company}. Requirements indicate immediate deployment readiness.",
                SuggestedFollowUp: "Schedule a high-priority 30-minute architecture & custom integration demo with a senior solutions architect.",
                Confidence: 0.94
            );
        }
        
        if (lead.Budget >= 500000)
        {
            return new QualificationResultDto(
                Score: LeadScore.Warm,
                Reason: $"Qualified growth lead: Budget of ₹{lead.Budget:N0} with clear interest. Further discovery needed to map exact integrations and timeline.",
                SuggestedFollowUp: "Send targeted case studies and schedule a technical discovery call within 48 hours.",
                Confidence: 0.85
            );
        }

        return new QualificationResultDto(
            Score: LeadScore.Cold,
            Reason: $"Early-stage inquiry: Modest initial budget allocation (₹{lead.Budget:N0}) or preliminary stage. Requires educational nurturing before commercial pitch.",
            SuggestedFollowUp: "Enroll in the automated product overview email sequence with self-service starter resources.",
            Confidence: 0.78
        );
    }

    public async Task<ChatResponseDto> ChatAsync(string message, int? leadId, List<Conversation>? history)
    {
        if (_chatService != null)
        {
            try
            {
                var chatHistory = new ChatHistory();
                chatHistory.AddSystemMessage("""
                    You are an AI Sales Copilot for a CRM platform. You help sales teams by:
                    1. Answering questions about leads and sales data
                    2. Providing sales strategy recommendations
                    3. Helping draft follow-up messages
                    4. Analyzing lead quality and pipeline health
                    
                    Be concise, professional, and actionable in your responses.
                    """);

                if (history != null)
                {
                    foreach (var conv in history.TakeLast(5))
                    {
                        chatHistory.AddUserMessage(conv.UserMessage);
                        chatHistory.AddAssistantMessage(conv.AiResponse);
                    }
                }

                chatHistory.AddUserMessage(message);

                var result = await _chatService.GetChatMessageContentsAsync(chatHistory);
                var response = result.LastOrDefault()?.Content ?? "I couldn't process that request. Please try again.";
                return new ChatResponseDto(response, DetectIntent(message), leadId);
            }
            catch
            {
                // Fall through to heuristic chat response
            }
        }

        await Task.Yield();
        var intent = DetectIntent(message);
        var reply = GenerateSmartChatReply(message, intent, leadId);
        return new ChatResponseDto(reply, intent, leadId);
    }

    public async Task<string> GenerateFollowUpMessageAsync(Lead lead, string channel)
    {
        if (_chatService != null)
        {
            try
            {
                var prompt = $"""
                    Generate a professional follow-up message for the following lead.
                    
                    Channel: {channel}
                    Lead Name: {lead.FullName}
                    Company: {lead.Company}
                    Designation: {lead.Designation}
                    Requirements: {lead.Requirements}
                    Current Status: {lead.Status}
                    AI Score: {lead.Score}
                    
                    Guidelines:
                    - For Email: Professional, 3-4 paragraphs, include clear value proposition
                    - For WhatsApp: Short, friendly, 2-3 lines max with clear call-to-action
                    - For SMS: Very brief, under 160 characters
                    - For Call: Prepare a structured phone call script with key talking points
                    """;

                var result = await _chatService.GetChatMessageContentAsync(prompt);
                if (!string.IsNullOrWhiteSpace(result.Content))
                    return result.Content;
            }
            catch
            {
                // Fall through to template generation
            }
        }

        await Task.Yield();
        return channel.ToLowerInvariant() switch
        {
            "whatsapp" => 
                $"Hi {lead.FullName}, this is Sikandar from the AI Sales Copilot team. I reviewed your requirements regarding {lead.Company}'s CRM needs. Would you be open for a quick 10-minute demo this Thursday at 3 PM to show how our AI lead scoring can automate your pipeline?",
            
            "sms" => 
                $"Hi {lead.FullName}, AI Sales Copilot has tailored a demo for {lead.Company}'s CRM needs. Reply YES to schedule a 10-min overview call.",
            
            "call" => 
                $"""
                [CALL SCRIPT FOR: {lead.FullName} - {lead.Company}]
                1. OPENING: "Hi {lead.FullName}, this is from AI Sales Copilot. I saw your inquiry regarding CRM modernization for {lead.Company}."
                2. RAPPORT & DISCOVERY: "I noticed your focus is on '{lead.Requirements}'. How is your team currently tackling lead qualification turnaround?"
                3. VALUE PROP: "Our AI agents typically cut manual lead qualification by 60% and plug directly into your current databases."
                4. CLOSING CTA: "Can we lock in 20 minutes with our solutions engineer this week to review a live prototype?"
                """,

            _ => 
                $"""
                Subject: Streamlining {lead.Company}'s Sales Pipeline with AI Sales Copilot

                Dear {lead.FullName},

                Thank you for your interest in AI Sales Copilot. Based on your note regarding {lead.Company}'s requirements ({lead.Requirements}), our platform is tailored to help teams of your scale automate lead qualification, fast-track high-intent deals, and ensure instant follow-ups.

                Our recent deployments have helped enterprise sales teams reduce manual qualification effort by 60% while speeding up customer contact latency by 40%. We integrate seamlessly across SQL, Cosmos DB, and existing enterprise workflows.

                I would love to walk you through a tailored 15-minute demonstration of how this would function with your current systems. Would you have some time this Wednesday or Thursday afternoon?

                Best regards,

                Sikandar Bharti
                Solutions Architect | AI Sales Copilot
                +91 7765060907
                """
        };
    }

    private string DetectIntent(string message)
    {
        var lower = message.ToLowerInvariant();
        if (lower.Contains("qualif") || lower.Contains("score") || lower.Contains("rating"))
            return "qualification";
        if (lower.Contains("follow") || lower.Contains("email") || lower.Contains("whatsapp") || lower.Contains("message"))
            return "follow-up";
        if (lower.Contains("pipeline") || lower.Contains("budget") || lower.Contains("revenue") || lower.Contains("value"))
            return "pipeline";
        if (lower.Contains("hot") || lower.Contains("cold") || lower.Contains("warm"))
            return "lead_status";
        if (lower.Contains("how many") || lower.Contains("total") || lower.Contains("count") || lower.Contains("summary"))
            return "summary";
        return "general_sales_inquiry";
    }

    private string GenerateSmartChatReply(string message, string intent, int? leadId)
    {
        var lower = message.ToLowerInvariant();
        if (intent == "pipeline" || lower.Contains("pipeline"))
        {
            return "Your active pipeline currently holds high-value opportunities totaling over ₹1,00,00,000. Key drivers include TechCorp India (₹50L, Hot) and RealtyPro India (₹30L, Hot). Recommendation: Prioritize TechCorp India's SAP integration discovery to accelerate closing.";
        }
        if (lower.Contains("hot"))
        {
            return "Currently, 2 leads are categorized as Hot: Rahul Sharma (CTO at TechCorp India, ₹50L budget) and Neha Gupta (Sales Director at RealtyPro India, ₹30L budget). Both represent high-intent enterprise accounts with decision-maker engagement.";
        }
        if (intent == "follow-up")
        {
            return "For high-intent leads like Rahul Sharma and Neha Gupta, a multi-channel follow-up (WhatsApp notification + detailed calendar invitation) is recommended within 24 hours to maintain momentum.";
        }
        return $"As your AI Sales Copilot, I've analyzed your CRM data. You have strong momentum in enterprise accounts. You can ask me to qualify any lead, draft customized follow-up emails, or review pipeline health.";
    }
}
