using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using StatusDashboard.Data;
using StatusDashboard.Entities;
using StatusDashboard.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IServicesService, ServicesService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (!db.Services.Any())
    {
        var json = File.ReadAllText("../seed-data/components.json");
        var root = JsonSerializer.Deserialize<JsonElement>(json);

        var components = root.GetProperty("components")
            .EnumerateArray()
            .Where(c => c.GetProperty("showcase").GetBoolean())
            .ToList();

        foreach (var c in components)
        {
            db.Services.Add(new Service
            {
                Name = c.GetProperty("name").GetString()!,
                Description = c.GetProperty("description").ValueKind != JsonValueKind.Null
                    ? c.GetProperty("description").GetString()
                    : null,
                Status = "operational"
            });
        }

        await db.SaveChangesAsync();
        Console.WriteLine($"Seeded {components.Count} services.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.MapControllers();

app.Run();
