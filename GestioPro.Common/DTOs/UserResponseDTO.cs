using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record UserResponseDTO(
    Guid Id,
    UserRole UserRole,
    string Username,
    string Email,
    string Name,
    string Surname,
    bool IsDisabled,
    bool EmailNotificationsEnabled,
    DateTimeOffset CreatedDate,
    DateTimeOffset LastUpdateDate
);
