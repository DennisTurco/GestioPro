using System.ComponentModel.DataAnnotations;

namespace GestioPro.Common.DTOs;

public record UserRequestDTO(
    [Required, MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(50)] string Email,
    [Required] string Password,
    [Required, MaxLength(50)] string Name,
    [Required, MaxLength(50)] string Surname
);
