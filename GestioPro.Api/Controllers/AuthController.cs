using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService, IUserService userService) : ControllerBase
{
    /// <summary>Login and get a JWT token</summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO dto)
    {
        var result = await authService.LoginAsync(dto);
        if (result is null) return Unauthorized(new { message = "Credenziali non valide" });
        return Ok(result);
    }

    /// <summary>Register a new account</summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRequestDTO dto)
    {
        await userService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }
}
