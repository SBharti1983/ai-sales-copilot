using Microsoft.EntityFrameworkCore;
using AISalesCopilot.Core.Entities;

namespace AISalesCopilot.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<FollowUp> FollowUps => Set<FollowUp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Lead configuration
        modelBuilder.Entity<Lead>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Phone).HasMaxLength(20);
            entity.Property(e => e.Company).HasMaxLength(200);
            entity.Property(e => e.Designation).HasMaxLength(100);
            entity.Property(e => e.Budget).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Requirements).HasMaxLength(2000);
            entity.Property(e => e.Notes).HasMaxLength(2000);
            entity.Property(e => e.AiQualificationReason).HasMaxLength(1000);
            entity.Property(e => e.AiSuggestedFollowUp).HasMaxLength(1000);

            entity.HasIndex(e => e.Email);
            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.Score);
        });

        // Conversation configuration
        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.UserMessage).IsRequired().HasMaxLength(4000);
            entity.Property(e => e.AiResponse).IsRequired().HasMaxLength(4000);
            entity.Property(e => e.Intent).HasMaxLength(100);

            entity.HasOne(e => e.Lead)
                .WithMany(l => l.Conversations)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // FollowUp configuration
        modelBuilder.Entity<FollowUp>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(2000);
            entity.Property(e => e.Channel).IsRequired().HasMaxLength(20);

            entity.HasOne(e => e.Lead)
                .WithMany(l => l.FollowUps)
                .HasForeignKey(e => e.LeadId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Seed demo data
        SeedData(modelBuilder);
    }

    private void SeedData(ModelBuilder modelBuilder)
    {
        var seedDate = new DateTime(2026, 1, 15, 10, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<Lead>().HasData(
            new Lead { Id = 1, FullName = "Rahul Sharma", Email = "rahul@techcorp.in", Phone = "+919876543210", Company = "TechCorp India", Designation = "CTO", Source = Core.Enums.LeadSource.Website, Status = Core.Enums.LeadStatus.New, Score = Core.Enums.LeadScore.Hot, Budget = 5000000, Requirements = "Need enterprise CRM with AI-powered lead management for 200+ sales team members. Must integrate with existing SAP system.", CreatedAt = seedDate },
            new Lead { Id = 2, FullName = "Priya Patel", Email = "priya@startupxyz.com", Phone = "+919876543211", Company = "StartupXYZ", Designation = "Founder", Source = Core.Enums.LeadSource.Referral, Status = Core.Enums.LeadStatus.Contacted, Score = Core.Enums.LeadScore.Warm, Budget = 500000, Requirements = "Looking for a basic CRM to manage 50 leads per month. Budget is limited but willing to scale.", CreatedAt = seedDate },
            new Lead { Id = 3, FullName = "Amit Kumar", Email = "amit@globalservices.com", Phone = "+919876543212", Company = "Global Services Ltd", Designation = "VP Sales", Source = Core.Enums.LeadSource.Advertisement, Status = Core.Enums.LeadStatus.New, Score = Core.Enums.LeadScore.Cold, Budget = 100000, Requirements = "Just exploring options. Currently using Excel for lead tracking.", CreatedAt = seedDate },
            new Lead { Id = 4, FullName = "Neha Gupta", Email = "neha@realtypro.in", Phone = "+919876543213", Company = "RealtyPro India", Designation = "Sales Director", Source = Core.Enums.LeadSource.SocialMedia, Status = Core.Enums.LeadStatus.Qualified, Score = Core.Enums.LeadScore.Hot, Budget = 3000000, Requirements = "Need CRM with WhatsApp integration, site visit scheduling, and AI lead scoring. Have 150 agents across 5 cities.", CreatedAt = seedDate },
            new Lead { Id = 5, FullName = "Vikram Singh", Email = "vikram@buildwell.com", Phone = "+919876543214", Company = "BuildWell Construction", Designation = "Marketing Head", Source = Core.Enums.LeadSource.ColdCall, Status = Core.Enums.LeadStatus.FollowUp, Score = Core.Enums.LeadScore.Warm, Budget = 1500000, Requirements = "Interested in AI-powered lead qualification. Currently losing leads due to slow follow-up response times.", CreatedAt = seedDate }
        );
    }
}
