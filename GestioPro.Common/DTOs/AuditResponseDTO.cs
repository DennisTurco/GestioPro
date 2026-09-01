using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record AuditResponseDTO(
    long Id,
    DateTimeOffset Timestamp,
    Guid UserId,
    string Username,
    string Action,
    string EntityType,
    string EntityId,
    string? OldValues,
    string? NewValues,
    string? IpAddress
);
