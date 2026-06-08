using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController(ISettingsService settingsService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpGet("{code}")]
    public async Task<IActionResult> GetByCode(string code)
    {
        // TODO
        throw new NotImplementedException();
    }

    [HttpPut("{code}")]
    public async Task<IActionResult> Update(string code, [FromBody] SettingsRequestDTO dto)
    {
        // TODO
        throw new NotImplementedException();
    }
}
