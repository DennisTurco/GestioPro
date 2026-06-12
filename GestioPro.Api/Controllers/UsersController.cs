using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController(IUserService userService) : ControllerBase
{

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userId, out var guid))
            return Unauthorized();

        var user = await userService.GetByIdAsync(guid);

        if (user is null)
            return NotFound();

        return Ok(user);
    }

    /// <summary>
    /// Return all users
    /// </summary>
    /// <returns>Complete list of users</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await userService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Returns a user by ID
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>The requested user</returns>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await userService.GetByIdAsync(id);
        return result is null ? NotFound() : Ok(result);
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    /// <param name="dto">User information</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserRequestDTO dto)
    {
        await userService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Update a user
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="dto">User information</param>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UserRequestDTO dto)
    {
        var updated = await userService.UpdateAsync(id, dto);

        if (updated is null)
            NotFound();

        return Ok(updated);
    }

    /// <summary>
    /// Delete a user
    /// </summary>
    /// <param name="id">User ID</param>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await userService.DeleteAsync(id);
        return NoContent();
    }
}
