namespace GestioPro.Common.DTOs;

public record LoginAuditResponseDTO(
    long Id,
    DateTimeOffset Timestamp,
    Guid? UserId,
    string Username,
    string Action,
    string Status,
    string? Notes,
    string? IpAddress
);
