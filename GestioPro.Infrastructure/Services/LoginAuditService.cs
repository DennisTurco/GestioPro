using System.Security.Claims;
using GestioPro.Common.DTOs;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class LoginAuditService(AppDbContext context, IHttpContextAccessor httpContextAccessor) : ILoginAuditService
{
    public async Task LogAsync(Guid? userId, string? username, string action, string status, string? notes)
    {
        var log = new LoginAudit
        {
            Timestamp = DateTimeOffset.UtcNow,
            UserId = userId,
            Username = username ?? "unknown",
            Action = action,
            Status = status,
            Notes = notes,
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
        };

        await context.LoginAudit.AddAsync(log);
        await context.SaveChangesAsync();
    }

    public async Task<List<LoginAuditResponseDTO>> GetAllAsync()
        => await context.LoginAudit
            .AsNoTracking()
            .Select(a => MapToDto(a))
            .ToListAsync();

    private static LoginAuditResponseDTO MapToDto(LoginAudit log)
        => new(
            log.Id,
            log.Timestamp,
            log.UserId,
            log.Username,
            log.Action,
            log.Status,
            log.Notes,
            log.IpAddress
        );
}
