namespace GestioPro.Common.DTOs;

public record UserUpdateDTO(
    string Username,
    string Email,
    string Name,
    string Surname
);
