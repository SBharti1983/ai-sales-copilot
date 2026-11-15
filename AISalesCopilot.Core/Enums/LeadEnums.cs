namespace AISalesCopilot.Core.Enums;

public enum LeadStatus
{
    New = 0,
    Contacted = 1,
    Qualified = 2,
    Unqualified = 3,
    FollowUp = 4,
    Converted = 5,
    Lost = 6
}

public enum LeadScore
{
    Cold = 0,
    Warm = 1,
    Hot = 2
}

public enum LeadSource
{
    Website = 0,
    Referral = 1,
    SocialMedia = 2,
    Advertisement = 3,
    ColdCall = 4,
    Other = 5
}
