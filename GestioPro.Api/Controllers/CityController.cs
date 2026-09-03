using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/locations")]
public class CityController(ICityService cityService) : ControllerBase
{
    /// <summary>
    /// Returns all city info by city name if possible
    /// </summary>
    /// <param name="city">city name</param>
    [HttpGet("lookup/{city}")]
    public async Task<IActionResult> GetByContractId(string city)
    {
        var result = cityService.GetByName(city);
        return Ok(result);
    }
}
