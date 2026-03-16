using Microsoft.AspNetCore.Mvc;
using StatusDashboard.DTOs;
using StatusDashboard.Services;

namespace StatusDashboard.Controllers;

[ApiController]
[Route("[controller]")]
public class ServicesController(IServicesService servicesService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var services = await servicesService.GetAllAsync();
        return Ok(services);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var service = await servicesService.GetByIdAsync(id);
        return service is null ? NotFound() : Ok(service);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateServiceDto dto)
    {
        var created = await servicesService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateServiceDto dto)
    {
        var updated = await servicesService.UpdateAsync(id, dto);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await servicesService.DeleteAsync(id);
        return deleted ? NoContent() : NotFound();
    }
}
