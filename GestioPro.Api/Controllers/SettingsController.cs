using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    /// <summary>
    /// Return all settings
    /// </summary>
    /// <returns>Complete list of settings</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await settingsService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a setting by code
    /// </summary>
    /// <param name="code">Setting code</param>
    /// <returns>The requested setting</returns>
    [HttpGet("{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        var result = await settingsService.GetByCodeAsync(code);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Update a setting
    /// </summary>
    /// <param name="code">Setting code</param>
    /// <param name="dto">Setting information</param>
    [HttpPut("{code}")]
    public async Task<IActionResult> Update(string code, [FromBody] SettingsRequestDTO dto)
    {
        var updated = await settingsService.UpdateAsync(code, dto);

        if (updated is null)
            return NotFound();

        return Ok(updated);
    }
}
