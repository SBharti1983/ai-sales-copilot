using Microsoft.EntityFrameworkCore;
using Microsoft.SemanticKernel;
using AISalesCopilot.Core.Interfaces;
using AISalesCopilot.Infrastructure.Data;
using AISalesCopilot.Infrastructure.Repositories;
using AISalesCopilot.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// --- Database Configuration (SQLite default for local dev, SQL Server configurable) ---
var dbProvider = builder.Configuration["DatabaseProvider"] ?? "Sqlite";
var connectionString = builder.Configuration.GetConnectionString(dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase) ? "DefaultConnection" : "SqliteConnection");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (dbProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(connectionString, b => b.MigrationsAssembly("AISalesCopilot.Infrastructure"));
    }
    else
    {
        options.UseSqlite(connectionString ?? "Data Source=salescopilot.db", b => b.MigrationsAssembly("AISalesCopilot.Infrastructure"));
    }
});

// --- Semantic Kernel (AI Engine) ---
var aiConfig = builder.Configuration.GetSection("OpenAI");
var modelId = aiConfig["ModelId"] ?? "gpt-4o-mini";
var apiKey = aiConfig["ApiKey"] ?? "";

if (!string.IsNullOrWhiteSpace(apiKey) && apiKey != "your-openai-api-key-here")
{
    builder.Services.AddKernel();
    builder.Services.AddOpenAIChatCompletion(modelId, apiKey);
}

// --- Repositories & Services ---
builder.Services.AddScoped<ILeadRepository, LeadRepository>();
builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
builder.Services.AddScoped<IFollowUpRepository, FollowUpRepository>();
builder.Services.AddScoped<IAiService, AiService>();

// --- Controllers & API Explorer ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi();

// --- CORS (for React frontend) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
    );
});

var app = builder.Build();

// --- Middleware ---
app.MapOpenApi();
app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

// --- Auto-create and seed database ---
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

app.Run();
