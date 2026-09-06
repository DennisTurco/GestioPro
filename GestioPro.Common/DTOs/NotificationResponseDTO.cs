namespace GestioPro.Common.DTOs;

public record NotificationResponseDTO(
    long Id,
    Guid UserId,
    string Summary,
    string? Description,
    bool IsRead,
    DateTimeOffset CreationDate
);
