using System.Security.Claims;
using System.Text.Json;
using GestioPro.Common.DTOs;
using GestioPro.Common.Exceptions;
using GestioPro.Common.Interfaces;
using GestioPro.Common.Models;
using GestioPro.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace GestioPro.Infrastructure.Services;

public class AuditService(AppDbContext context, IHttpContextAccessor httpContextAccessor) : IAuditService
{
    public async Task LogAsync(string action, string entityType, string entityId, object? oldValues = null, object? newValues = null)
    {
        var user = httpContextAccessor.HttpContext?.User;
        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid.TryParse(userIdClaim, out var userId);

        var log = new Audit
        {
            Timestamp = DateTimeOffset.UtcNow,
            UserId = userId,
            Username = user?.FindFirst(ClaimTypes.Name)?.Value ?? "unknown",
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            OldValues = oldValues is null ? null : JsonSerializer.Serialize(oldValues),
            NewValues = newValues is null ? null : JsonSerializer.Serialize(newValues),
            IpAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
        };

        await context.Audit.AddAsync(log);
        await context.SaveChangesAsync();
    }

    public async Task<List<AuditResponseDTO>> GetAuditsAsync()
        => await context.Audit
            .AsNoTracking()
            .Select(a => MapToDto(a))
            .ToListAsync();

    public async Task<AuditResponseDTO> GetAuditByIdAsync(long id)
    {
        var log = await context.Audit
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id) ?? throw new BusinessException($"Impossibile trovare il log con id: {id}");

        return MapToDto(log);
    }

    private static AuditResponseDTO MapToDto(Audit log)
        => new (
            log.Id,
            log.Timestamp,
            log.UserId,
            log.Username,
            log.Action,
            log.EntityType,
            log.EntityId,
            log.OldValues,
            log.NewValues,
            log.IpAddress
        );
}
