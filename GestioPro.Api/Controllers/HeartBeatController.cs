using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/heartbeat")]
public class HeartBeatController(IHeartBeatService heartBeatService) : ControllerBase
{
    /// <summary>
    /// Returns the timestamp of the last heartbeat ping
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetLast()
    {
        var result = await heartBeatService.GetLastAsync();
        return Ok(result);
    }

    /// <summary>
    /// Manually triggers a heartbeat ping (writes to the database to keep it active)
    /// </summary>
    [HttpPost("ping")]
    public async Task<IActionResult> Ping()
    {
        var result = await heartBeatService.PingAsync();
        return Ok(result);
    }
}
