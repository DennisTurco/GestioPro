using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common;
using GestioPro.Common.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/settings")]
public class SettingsController(ISettingsService settingsService, IMailService mailService, IUserService userService) : ControllerBase
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

    /// <summary>
    /// Return the SMTP server used for outgoing emails (without the password)
    /// </summary>
    [Authorize(Roles = "Admin")]
    [HttpGet("smtp")]
    public async Task<IActionResult> GetSmtp()
    {
        var result = await settingsService.GetSmtpAsync();
        return Ok(result);
    }

    /// <summary>
    /// Update the SMTP server used for outgoing emails
    /// </summary>
    /// <param name="dto">SMTP settings: a null password keeps the saved one</param>
    [Authorize(Roles = "Admin")]
    [HttpPut("smtp")]
    public async Task<IActionResult> UpdateSmtp([FromBody] SmtpSettingsRequestDTO dto)
    {
        var result = await settingsService.UpdateSmtpAsync(dto);
        return Ok(result);
    }

    /// <summary>
    /// Send a test email to the current user with the given (not yet saved) SMTP settings
    /// </summary>
    /// <param name="dto">SMTP settings to test: a null password uses the saved one</param>
    [Authorize(Roles = "Admin")]
    [HttpPost("smtp/test")]
    public async Task<IActionResult> TestSmtp([FromBody] SmtpSettingsRequestDTO dto)
    {
        var config = await settingsService.ResolveSmtpConfigurationAsync(dto);

        var callerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var user = Guid.TryParse(callerId, out var id) ? await userService.GetByIdAsync(id) : null;
        if (user is null || string.IsNullOrWhiteSpace(user.Email))
            throw new DomainException("Il tuo utente non ha un indirizzo email a cui inviare la prova");

        await mailService.SendEmailAsync(
            [new Address($"{user.Name} {user.Surname}", user.Email)],
            "Email di prova",
            "Se stai leggendo questo messaggio, il server email di GestioPro è configurato correttamente.",
            config);

        return Ok(new { sentTo = user.Email });
    }
}
