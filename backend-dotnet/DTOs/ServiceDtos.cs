namespace StatusDashboard.DTOs;

public record ServiceDto(int Id, string Name, string? Description, string Status);

public record CreateServiceDto(string Name, string? Description, string Status);

public record UpdateServiceDto(string? Name, string? Description, string? Status);
