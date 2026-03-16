using Microsoft.EntityFrameworkCore;
using StatusDashboard.Data;
using StatusDashboard.DTOs;
using StatusDashboard.Entities;

namespace StatusDashboard.Services;

public class ServicesService(AppDbContext db) : IServicesService
{
    public async Task<IEnumerable<ServiceDto>> GetAllAsync()
    {
        return await db.Services
            .OrderBy(s => s.Id)
            .Select(s => ToDto(s))
            .ToListAsync();
    }

    public async Task<ServiceDto?> GetByIdAsync(int id)
    {
        var service = await db.Services.FindAsync(id);
        return service is null ? null : ToDto(service);
    }

    public async Task<ServiceDto> CreateAsync(CreateServiceDto dto)
    {
        var service = new Service
        {
            Name = dto.Name,
            Description = dto.Description,
            Status = dto.Status
        };

        db.Services.Add(service);
        await db.SaveChangesAsync();

        return ToDto(service);
    }

    public async Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto)
    {
        var service = await db.Services.FindAsync(id);
        if (service is null) return null;

        if (dto.Name is not null) service.Name = dto.Name;
        if (dto.Description is not null) service.Description = dto.Description;
        if (dto.Status is not null) service.Status = dto.Status;

        await db.SaveChangesAsync();

        return ToDto(service);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var service = await db.Services.FindAsync(id);
        if (service is null) return false;

        db.Services.Remove(service);
        await db.SaveChangesAsync();

        return true;
    }

    private static ServiceDto ToDto(Service s) =>
        new(s.Id, s.Name, s.Description, s.Status);
}
