namespace GestioPro.Common.DTOs;

public record LoginResponseDTO(
    string Token,
    UserResponseDTO User
);
