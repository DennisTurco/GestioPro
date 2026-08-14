using System.ComponentModel.DataAnnotations;
using GestioPro.Common.Enums;

namespace GestioPro.Common.DTOs;

public record UserRequestDTO(
    [Required] UserRole UserRole,
    [Required, MaxLength(50)] string Username,
    [Required, EmailAddress, MaxLength(50)] string Email,
    [Required] string Password,
    [Required, MaxLength(50)] string Name,
    [Required, MaxLength(50)] string Surname,
    bool IsDisabled = false
);
