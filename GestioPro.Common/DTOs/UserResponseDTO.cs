namespace GestioPro.Common.DTOs;

public record UserResponseDTO(
    Guid Id,
    string Username,
    string Email,
    string Name,
    string Surname,
    DateOnly CreatedDate
);
