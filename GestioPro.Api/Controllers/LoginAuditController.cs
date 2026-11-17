using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/audit-login")]
[Authorize(Roles = "Admin")]
public class LoginAuditController(ILoginAuditService loginAuditService) : ControllerBase
{
    /// <summary>
    /// Return all login audit logs
    /// </summary>
    /// <returns>Complete list of login audit logs</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await loginAuditService.GetAllAsync();
        return Ok(result);
    }
}
