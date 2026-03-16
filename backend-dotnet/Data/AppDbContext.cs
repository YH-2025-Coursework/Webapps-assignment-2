using Microsoft.EntityFrameworkCore;
using StatusDashboard.Entities;

namespace StatusDashboard.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Service> Services { get; set; }
}
