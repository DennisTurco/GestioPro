using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/audit")]
[Authorize(Roles = "Admin")]
public class AuditController(IAuditService auditService) : ControllerBase
{
    /// <summary>
    /// Return all audit logs
    /// </summary>
    /// <returns>Complete list of audit logs</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await auditService.GetAuditsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns an audit log by ID
    /// </summary>
    /// <param name="id">Audit ID</param>
    /// <returns>The requested audit log</returns>
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var result = await auditService.GetAuditByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }
}
