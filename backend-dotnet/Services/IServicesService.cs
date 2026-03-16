using StatusDashboard.DTOs;

namespace StatusDashboard.Services;

public interface IServicesService
{
    Task<IEnumerable<ServiceDto>> GetAllAsync();
    Task<ServiceDto?> GetByIdAsync(int id);
    Task<ServiceDto> CreateAsync(CreateServiceDto dto);
    Task<ServiceDto?> UpdateAsync(int id, UpdateServiceDto dto);
    Task<bool> DeleteAsync(int id);
}
