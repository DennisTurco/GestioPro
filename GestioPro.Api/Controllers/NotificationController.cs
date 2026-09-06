using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GestioPro.Api.Controllers;

[ApiController]
[Route("api/v1/notifications")]
public class NotificationController(INotificationService notificationService) : ControllerBase
{
    /// <summary>
    /// Return all notifications for the currently authenticated user
    /// </summary>
    /// <returns>User's notification list</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllByUserIdAsync()
    {
        var userId =
            User.FindFirst(ClaimTypes.NameIdentifier)?.Value ??
            User.FindFirst("sub")?.Value;

        if (!Guid.TryParse(userId, out var guid))
            return Unauthorized();

        var notifications = await notificationService.GetAllByUserIdAsync(guid);
        return Ok(notifications);
    }

    /// <summary>
    /// Create a notification for all the users registered in the system
    /// </summary>
    /// <param name="dto">Notification information</param>
    [HttpPost]
    public async Task<IActionResult> CreateAsync(NotificationRequestDTO dto)
    {
        await notificationService.CreateAsync(dto);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Create a notification for a specific user
    /// </summary>
    /// <param name="dto">Notification information</param>
    /// <param name="userId">User id target</param>
    [HttpPost("user/{userId:guid}")]
    public async Task<IActionResult> CreateByUserIdAsync(NotificationRequestDTO dto, Guid userId)
    {
        await notificationService.CreateByUserIdAsync(dto, userId);
        return StatusCode(StatusCodes.Status201Created);
    }

    /// <summary>
    /// Mark a notification as read
    /// </summary>
    /// <param name="id">Notification id</param>
    [HttpPut]
    public async Task<IActionResult> MarkAsReadAsync(long id)
    {
        var notification = await notificationService.MarkAsReadAsync(id);
        return Ok(notification);
    }

    /// <summary>
    /// Delete a notification
    /// </summary>
    /// <param name="id">Contract ID</param>
    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        await notificationService.DeleteAsync(id);
        return NoContent();
    }
}
